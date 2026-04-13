import type { SupabaseClient } from '@supabase/supabase-js'
import type { Post, PostStatus } from '@/types/posts'
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
  statusFilter?: PostStatus,
): Promise<Result<Post[]>> {
  let query = supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as Post[])
}

export async function getPostById(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
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
  input: UpdatePostData,
): Promise<Result<Post>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function publishPost(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function unpublishPost(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Post>> {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'draft' })
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Post)
}

export async function deletePost(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) return err(error.message)
  return ok(true as const)
}
