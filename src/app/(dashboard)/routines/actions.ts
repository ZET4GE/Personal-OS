'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateRoutineSchema,
  UpdateRoutineSchema,
  CreateRoutineItemSchema,
  UpdateRoutineItemSchema,
} from '@/lib/validations/habits'
import {
  createRoutine,
  updateRoutine,
  deleteRoutine,
  createRoutineItem,
  updateRoutineItem,
  deleteRoutineItem,
  toggleRoutineItem,
  completeRoutine,
} from '@/services/routines'
import type { RoutineActionResult, RoutineLogActionResult } from '@/types/habits'

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────
// Routine CRUD
// ─────────────────────────────────────────────────────────────

export async function createRoutineAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreateRoutineSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createRoutine(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/routines')
  return { routine: result.data! }
}

export async function updateRoutineAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase } = await getAuthed()
  const parsed = UpdateRoutineSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateRoutine(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/routines')
  revalidatePath(`/routines/${parsed.data.id}`)
  return { routine: result.data! }
}

export async function deleteRoutineAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase } = await getAuthed()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteRoutine(supabase, id)
  if (error) return { error }

  revalidatePath('/routines')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Routine items
// ─────────────────────────────────────────────────────────────

export async function createRoutineItemAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreateRoutineItemSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createRoutineItem(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/routines')
  revalidatePath(`/routines/${parsed.data.routine_id}`)
  return { ok: true }
}

export async function updateRoutineItemAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase } = await getAuthed()
  const parsed = UpdateRoutineItemSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateRoutineItem(supabase, parsed.data)
  if (result.error) return { error: result.error }

  const routineId = formData.get('routine_id')
  revalidatePath('/routines')
  if (typeof routineId === 'string') revalidatePath(`/routines/${routineId}`)
  return { ok: true }
}

export async function deleteRoutineItemAction(formData: FormData): Promise<RoutineActionResult> {
  const { supabase } = await getAuthed()
  const id        = formData.get('id')
  const routineId = formData.get('routine_id')

  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteRoutineItem(supabase, id)
  if (error) return { error }

  revalidatePath('/routines')
  if (typeof routineId === 'string') revalidatePath(`/routines/${routineId}`)
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Routine logs
// ─────────────────────────────────────────────────────────────

export async function toggleRoutineItemAction(formData: FormData): Promise<RoutineLogActionResult> {
  const { supabase, user } = await getAuthed()
  const routineId = formData.get('routine_id')
  const itemId    = formData.get('item_id')
  const date      = formData.get('date')

  if (typeof routineId !== 'string' || !routineId) return { error: 'routine_id requerido' }
  if (typeof itemId    !== 'string' || !itemId)    return { error: 'item_id requerido' }
  if (typeof date      !== 'string' || !date)      return { error: 'date requerido' }

  const result = await toggleRoutineItem(supabase, user.id, routineId, itemId, date)
  if (result.error) return { error: result.error }

  revalidatePath('/routines')
  revalidatePath(`/routines/${routineId}`)
  return { log: result.data! }
}

export async function completeRoutineAction(formData: FormData): Promise<RoutineLogActionResult> {
  const { supabase, user } = await getAuthed()
  const routineId    = formData.get('routine_id')
  const date         = formData.get('date')
  const itemsRaw     = formData.get('completed_items')

  if (typeof routineId !== 'string' || !routineId) return { error: 'routine_id requerido' }
  if (typeof date      !== 'string' || !date)      return { error: 'date requerido' }

  const completedItems: string[] = typeof itemsRaw === 'string' && itemsRaw
    ? itemsRaw.split(',').filter(Boolean)
    : []

  const result = await completeRoutine(supabase, user.id, routineId, date, completedItems)
  if (result.error) return { error: result.error }

  revalidatePath('/routines')
  revalidatePath(`/routines/${routineId}`)
  return { log: result.data! }
}
