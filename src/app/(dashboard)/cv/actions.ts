'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateWorkExperienceSchema,
  UpdateWorkExperienceSchema,
  CreateEducationSchema,
  UpdateEducationSchema,
  CreateSkillSchema,
  UpdateSkillSchema,
} from '@/lib/validations/cv'
import {
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  createEducation,
  updateEducation,
  deleteEducation,
  createSkill,
  updateSkill,
  deleteSkill,
} from '@/services/cv'
import type {
  WorkExperienceActionResult,
  EducationActionResult,
  SkillActionResult,
} from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Helpers
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
// Work Experience actions
// ─────────────────────────────────────────────────────────────

export async function createWorkExperienceAction(
  formData: FormData,
): Promise<WorkExperienceActionResult> {
  const { supabase, user } = await getAuthedClient()
  const parsed = CreateWorkExperienceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createWorkExperience(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/experience')
  return { item: result.data! }
}

export async function updateWorkExperienceAction(
  formData: FormData,
): Promise<WorkExperienceActionResult> {
  const { supabase } = await getAuthedClient()
  const parsed = UpdateWorkExperienceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateWorkExperience(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/experience')
  return { item: result.data! }
}

export async function deleteWorkExperienceAction(
  formData: FormData,
): Promise<WorkExperienceActionResult> {
  const { supabase } = await getAuthedClient()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteWorkExperience(supabase, id)
  if (error) return { error }

  revalidatePath('/cv')
  revalidatePath('/cv/experience')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Education actions
// ─────────────────────────────────────────────────────────────

export async function createEducationAction(
  formData: FormData,
): Promise<EducationActionResult> {
  const { supabase, user } = await getAuthedClient()
  const parsed = CreateEducationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createEducation(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/education')
  return { item: result.data! }
}

export async function updateEducationAction(
  formData: FormData,
): Promise<EducationActionResult> {
  const { supabase } = await getAuthedClient()
  const parsed = UpdateEducationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateEducation(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/education')
  return { item: result.data! }
}

export async function deleteEducationAction(
  formData: FormData,
): Promise<EducationActionResult> {
  const { supabase } = await getAuthedClient()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteEducation(supabase, id)
  if (error) return { error }

  revalidatePath('/cv')
  revalidatePath('/cv/education')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Skills actions
// ─────────────────────────────────────────────────────────────

export async function createSkillAction(
  formData: FormData,
): Promise<SkillActionResult> {
  const { supabase, user } = await getAuthedClient()
  const parsed = CreateSkillSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createSkill(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/skills')
  return { item: result.data! }
}

export async function updateSkillAction(
  formData: FormData,
): Promise<SkillActionResult> {
  const { supabase } = await getAuthedClient()
  const parsed = UpdateSkillSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateSkill(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/cv')
  revalidatePath('/cv/skills')
  return { item: result.data! }
}

export async function deleteSkillAction(
  formData: FormData,
): Promise<SkillActionResult> {
  const { supabase } = await getAuthedClient()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteSkill(supabase, id)
  if (error) return { error }

  revalidatePath('/cv')
  revalidatePath('/cv/skills')
  return { ok: true }
}
