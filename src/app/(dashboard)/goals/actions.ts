'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateGoalSchema, UpdateGoalSchema, DeleteGoalSchema, ToggleGoalStatusSchema,
  CreateMilestoneSchema, UpdateMilestoneSchema, DeleteMilestoneSchema, ToggleMilestoneSchema,
  CreateGoalUpdateSchema, DeleteGoalUpdateSchema,
} from '@/lib/validations/goals'
import {
  createGoal, updateGoal, deleteGoal, toggleGoalStatus,
} from '@/services/goals'
import {
  createMilestone, updateMilestone, deleteMilestone, toggleMilestone,
} from '@/services/milestones'
import {
  createUpdate, deleteUpdate,
} from '@/services/goal-updates'
import type {
  GoalActionResult, MilestoneActionResult, GoalUpdateActionResult, DeleteActionResult,
} from '@/types/goals'

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

function revalidateGoals(id?: string) {
  revalidatePath('/goals')
  if (id) revalidatePath(`/goals/${id}`)
}

// ─────────────────────────────────────────────────────────────
// Goal actions
// ─────────────────────────────────────────────────────────────

export async function createGoalAction(formData: FormData): Promise<GoalActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreateGoalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createGoal(supabase, user.id, parsed.data)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals()
  return { success: true, goal: result.data! }
}

export async function updateGoalAction(formData: FormData): Promise<GoalActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = UpdateGoalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { id, ...data } = parsed.data
  const result = await updateGoal(supabase, id, user.id, data)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals(id)
  return { success: true, goal: result.data! }
}

export async function deleteGoalAction(formData: FormData): Promise<DeleteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = DeleteGoalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'ID inválido' }

  const result = await deleteGoal(supabase, parsed.data.id, user.id)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals()
  return { success: true }
}

export async function toggleGoalStatusAction(formData: FormData): Promise<GoalActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = ToggleGoalStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'Datos inválidos' }

  const result = await toggleGoalStatus(supabase, parsed.data.id, user.id, parsed.data.status)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals(parsed.data.id)
  return { success: true, goal: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Milestone actions
// ─────────────────────────────────────────────────────────────

export async function createMilestoneAction(formData: FormData): Promise<MilestoneActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreateMilestoneSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createMilestone(supabase, user.id, parsed.data)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals(parsed.data.goal_id)
  return { success: true, milestone: result.data! }
}

export async function updateMilestoneAction(formData: FormData): Promise<MilestoneActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = UpdateMilestoneSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const { id, ...data } = parsed.data
  const result = await updateMilestone(supabase, id, user.id, data)
  if (result.error) return { success: false, error: result.error }

  revalidatePath('/goals')
  return { success: true, milestone: result.data! }
}

export async function deleteMilestoneAction(formData: FormData): Promise<DeleteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = DeleteMilestoneSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'ID inválido' }

  const result = await deleteMilestone(supabase, parsed.data.id, user.id)
  if (result.error) return { success: false, error: result.error }

  revalidatePath('/goals')
  return { success: true }
}

export async function toggleMilestoneAction(formData: FormData): Promise<MilestoneActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = ToggleMilestoneSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'ID inválido' }

  const result = await toggleMilestone(supabase, parsed.data.id, user.id)
  if (result.error) return { success: false, error: result.error }

  revalidatePath('/goals')
  return { success: true, milestone: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Goal update actions
// ─────────────────────────────────────────────────────────────

export async function createGoalUpdateAction(formData: FormData): Promise<GoalUpdateActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreateGoalUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createUpdate(supabase, user.id, parsed.data)
  if (result.error) return { success: false, error: result.error }

  revalidateGoals(parsed.data.goal_id)
  return { success: true, update: result.data! }
}

export async function deleteGoalUpdateAction(formData: FormData): Promise<DeleteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = DeleteGoalUpdateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: 'ID inválido' }

  const result = await deleteUpdate(supabase, parsed.data.id, user.id)
  if (result.error) return { success: false, error: result.error }

  revalidatePath('/goals')
  return { success: true }
}
