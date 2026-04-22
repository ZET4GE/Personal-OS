'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateClientProjectSchema,
  UpdateClientProjectSchema,
  UpdateProjectStatusSchema,
  CreatePaymentSchema,
} from '@/lib/validations/clients'
import {
  createClientProject,
  updateClientProject,
  updateClientProjectStatus,
  deleteClientProject,
} from '@/services/client-projects'
import { createPayment, deletePayment } from '@/services/payments'
import type { ClientProjectActionResult, PaymentActionResult } from '@/types/clients'

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

// ── Client Projects ───────────────────────────────────────────

export async function createProjectAction(formData: FormData): Promise<ClientProjectActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreateClientProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createClientProject(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/freelance')
  revalidatePath('/clients')
  return { project: result.data! }
}

export async function updateProjectAction(formData: FormData): Promise<ClientProjectActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = UpdateClientProjectSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateClientProject(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/freelance')
  revalidatePath(`/freelance/${parsed.data.id}`)
  return { project: result.data! }
}

export async function updateProjectStatusAction(formData: FormData): Promise<ClientProjectActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = UpdateProjectStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Estado inválido' }

  const { error } = await updateClientProjectStatus(supabase, user.id, parsed.data.id, parsed.data.status)
  if (error) return { error }

  revalidatePath('/freelance')
  revalidatePath(`/freelance/${parsed.data.id}`)
  return { ok: true }
}

export async function deleteProjectAction(formData: FormData): Promise<ClientProjectActionResult> {
  const { supabase, user } = await getAuthed()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteClientProject(supabase, user.id, id)
  if (error) return { error }

  revalidatePath('/freelance')
  return { ok: true }
}

// ── Payments ─────────────────────────────────────────────────

export async function createPaymentAction(formData: FormData): Promise<PaymentActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreatePaymentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createPayment(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath(`/freelance/${parsed.data.project_id}`)
  revalidatePath('/freelance')
  return { payment: result.data! }
}

export async function deletePaymentAction(formData: FormData): Promise<PaymentActionResult> {
  const { supabase, user } = await getAuthed()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  // Obtener project_id antes de borrar para revalidar
  const projectId = formData.get('project_id') as string

  const { error } = await deletePayment(supabase, user.id, id)
  if (error) return { error }

  if (projectId) {
    revalidatePath(`/freelance/${projectId}`)
    revalidatePath('/freelance')
  }
  return { ok: true }
}
