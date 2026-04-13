'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateJobSchema, UpdateJobSchema, UpdateStatusSchema } from '@/lib/validations/jobs'
import { createJob, updateJob, updateJobStatus, deleteJob } from '@/services/jobs'
import type { JobActionResult } from '@/types/jobs'

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
// Create
// ─────────────────────────────────────────────────────────────

export async function createJobAction(formData: FormData): Promise<JobActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = CreateJobSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const result = await createJob(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/jobs')
  // result.data no es null aquí: result.error fue chequeado arriba
  return { job: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────

export async function updateJobAction(formData: FormData): Promise<JobActionResult> {
  const { supabase } = await getAuthedClient()

  const parsed = UpdateJobSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const result = await updateJob(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/jobs')
  return { job: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Update status (quick action desde la tarjeta)
// ─────────────────────────────────────────────────────────────

export async function updateStatusAction(formData: FormData): Promise<JobActionResult> {
  const { supabase } = await getAuthedClient()

  const parsed = UpdateStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Estado inválido' }
  }

  const { error } = await updateJobStatus(supabase, parsed.data.id, parsed.data.status)
  if (error) return { error }

  revalidatePath('/jobs')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────

export async function deleteJobAction(formData: FormData): Promise<JobActionResult> {
  const { supabase } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteJob(supabase, id)
  if (error) return { error }

  revalidatePath('/jobs')
  return { ok: true }
}
