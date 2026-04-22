'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  TogglePublicSchema,
} from '@/lib/validations/projects'
import {
  createProject,
  updateProject,
  togglePublic,
  deleteProject,
} from '@/services/projects'
import type { ProjectActionResult } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────

export async function createProjectAction(
  formData: FormData,
): Promise<ProjectActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = CreateProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const result = await createProject(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/projects')
  return { project: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────

export async function updateProjectAction(
  formData: FormData,
): Promise<ProjectActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = UpdateProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const result = await updateProject(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/projects')
  return { project: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Toggle public/private
// ─────────────────────────────────────────────────────────────

export async function togglePublicAction(
  formData: FormData,
): Promise<ProjectActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = TogglePublicSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { id, is_public } = parsed.data
  const result = await togglePublic(supabase, user.id, id, is_public)
  if (result.error) return { error: result.error }

  revalidatePath('/projects')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────

export async function deleteProjectAction(
  formData: FormData,
): Promise<ProjectActionResult> {
  const { supabase, user } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deleteProject(supabase, user.id, id)
  if (result.error) return { error: result.error }

  revalidatePath('/projects')
  return { ok: true }
}
