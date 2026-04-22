'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreatePostSchema, UpdatePostSchema, PublishPostSchema } from '@/lib/validations/posts'
import {
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
} from '@/services/posts'
import type { PostActionResult } from '@/types/posts'

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

function revalidateBlog() {
  revalidatePath('/blog')
  revalidatePath('/blog/[id]/edit', 'page')
}

// ─────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────

export async function createPostAction(formData: FormData): Promise<PostActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreatePostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createPost(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidateBlog()
  return { post: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────

export async function updatePostAction(formData: FormData): Promise<PostActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = UpdatePostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updatePost(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidateBlog()
  return { post: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Publish / Unpublish
// ─────────────────────────────────────────────────────────────

export async function publishPostAction(formData: FormData): Promise<PostActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = PublishPostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const result = await publishPost(supabase, user.id, parsed.data.id)
  if (result.error) return { error: result.error }

  revalidateBlog()
  return { post: result.data! }
}

export async function unpublishPostAction(formData: FormData): Promise<PostActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = PublishPostSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const result = await unpublishPost(supabase, user.id, parsed.data.id)
  if (result.error) return { error: result.error }

  revalidateBlog()
  return { post: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────

export async function deletePostAction(formData: FormData): Promise<PostActionResult> {
  const { supabase, user } = await getAuthed()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deletePost(supabase, user.id, id)
  if (result.error) return { error: result.error }

  revalidateBlog()
  return { ok: true }
}
