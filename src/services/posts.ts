import type { SupabaseClient } from '@supabase/supabase-js'
import type { Post, PostStatus, PostWithAuthor } from '@/types/posts'
import type { CreatePostData, UpdatePostData } from '@/lib/validations/posts'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// Dashboard queries (authed user — RLS handles ownership)
// ─────────────────────────────────────────────────────────────

export async function getPosts(
  supabase: SupabaseClient,
  userId: string,
  statusFilter?: PostStatus,
): Promise<Result<Post[]>> {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as Post[])
}

export async function getPostById(
  supabase: SupabaseClient,
  id: string,
  userId: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) return err('Post no encontrado')
  return ok(data as Post)
}

// ─────────────────────────────────────────────────────────────
// Public queries (anonymous reader)
// ─────────────────────────────────────────────────────────────

export async function getPublicPosts(
  supabase: SupabaseClient,
  userId: string,
  tag?: string,
): Promise<Result<Post[]>> {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (tag) query = query.contains('tags', [tag])

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as Post[])
}

export async function getPublicPostsFeed(
  supabase: SupabaseClient,
  tag?: string,
): Promise<Result<PostWithAuthor[]>> {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (tag) query = query.contains('tags', [tag])

  const { data: posts, error } = await query
  if (error) return err(error.message)

  const publishedPosts = (posts ?? []) as Post[]
  if (publishedPosts.length === 0) return ok([])

  const userIds = [...new Set(publishedPosts.map((post) => post.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', userIds)

  if (profilesError) return err(profilesError.message)

  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

  const feed = publishedPosts.flatMap((post) => {
    const profile = profilesById.get(post.user_id)
    if (!profile) return []

    return [{
      ...post,
      author: {
        username:   profile.username,
        full_name:  profile.full_name,
        avatar_url: profile.avatar_url,
      },
    }]
  })

  return ok(feed)
}

export async function getPostBySlug(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return err('Post no encontrado')
  return ok(data as Post)
}

// Returns prev and next published posts for navigation
export async function getAdjacentPosts(
  supabase: SupabaseClient,
  userId: string,
  publishedAt: string,
): Promise<{ prev: Post | null; next: Post | null }> {
  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, slug, published_at')
      .eq('user_id', userId)
      .eq('status', 'published')
      .lt('published_at', publishedAt)
      .order('published_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('posts')
      .select('id, title, slug, published_at')
      .eq('user_id', userId)
      .eq('status', 'published')
      .gt('published_at', publishedAt)
      .order('published_at', { ascending: true })
      .limit(1)
      .single(),
  ])

  return {
    prev: prevRes.data as Post | null,
    next: nextRes.data as Post | null,
  }
}

// ─────────────────────────────────────────────────────────────
// CRUD (authed user)
// ─────────────────────────────────────────────────────────────

export async function createPost(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePostData,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...input, user_id: userId, slug: input.slug ?? '' })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function updatePost(
  supabase: SupabaseClient,
  userId: string,
  input: UpdatePostData,
): Promise<Result<Post>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('posts')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function publishPost(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function unpublishPost(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'draft' })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function deletePost(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('posts').delete().eq('id', id).eq('user_id', userId)
  if (error) return err(error.message)
  return ok(true as const)
}
