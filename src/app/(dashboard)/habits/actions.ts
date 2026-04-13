'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateHabitSchema,
  UpdateHabitSchema,
  UpdateHabitActiveSchema,
} from '@/lib/validations/habits'
import {
  createHabit,
  updateHabit,
  setHabitActive,
  deleteHabit,
  toggleHabitLog,
} from '@/services/habits'
import type { HabitActionResult, HabitLogActionResult } from '@/types/habits'

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────
// Habit CRUD
// ─────────────────────────────────────────────────────────────

export async function createHabitAction(formData: FormData): Promise<HabitActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreateHabitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createHabit(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/habits')
  revalidatePath('/habits/manage')
  return { habit: result.data! }
}

export async function updateHabitAction(formData: FormData): Promise<HabitActionResult> {
  const { supabase } = await getAuthed()
  const parsed = UpdateHabitSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateHabit(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/habits')
  revalidatePath('/habits/manage')
  return { habit: result.data! }
}

export async function setHabitActiveAction(formData: FormData): Promise<HabitActionResult> {
  const { supabase } = await getAuthed()
  const parsed = UpdateHabitActiveSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Datos inválidos' }

  const { error } = await setHabitActive(supabase, parsed.data.id, parsed.data.is_active)
  if (error) return { error }

  revalidatePath('/habits')
  revalidatePath('/habits/manage')
  return { ok: true }
}

export async function deleteHabitAction(formData: FormData): Promise<HabitActionResult> {
  const { supabase } = await getAuthed()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteHabit(supabase, id)
  if (error) return { error }

  revalidatePath('/habits')
  revalidatePath('/habits/manage')
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Habit log toggle
// ─────────────────────────────────────────────────────────────

export async function toggleHabitLogAction(formData: FormData): Promise<HabitLogActionResult> {
  const { supabase, user } = await getAuthed()
  const habitId = formData.get('habit_id')
  const date    = formData.get('date')

  if (typeof habitId !== 'string' || !habitId) return { error: 'habit_id requerido' }
  if (typeof date    !== 'string' || !date)    return { error: 'date requerido' }

  const result = await toggleHabitLog(supabase, user.id, habitId, date)
  if (result.error) return { error: result.error }

  revalidatePath('/habits')
  return result.data!
}
