import type { SupabaseClient } from '@supabase/supabase-js'
import type { Milestone } from '@/types/goals'
import type { CreateMilestoneData, UpdateMilestoneData } from '@/lib/validations/goals'

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

export async function getMilestones(
  supabase: SupabaseClient,
  goalId:   string,
): Promise<Result<Milestone[]>> {
  const { data, error: e } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', goalId)
    .order('order_index', { ascending: true })

  if (e) return err(e.message)
  return ok(data as Milestone[])
}

export async function createMilestone(
  supabase: SupabaseClient,
  userId:   string,
  data:     CreateMilestoneData,
): Promise<Result<Milestone>> {
  const { data: milestone, error: e } = await supabase
    .from('milestones')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (e) return err(e.message)
  return ok(milestone as Milestone)
}

export async function updateMilestone(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
  data:     Omit<UpdateMilestoneData, 'id'>,
): Promise<Result<Milestone>> {
  const { data: milestone, error: e } = await supabase
    .from('milestones')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (e) return err(e.message)
  return ok(milestone as Milestone)
}

export async function deleteMilestone(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
): Promise<Result<void>> {
  const { error: e } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (e) return err(e.message)
  return ok(undefined)
}

export async function toggleMilestone(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
): Promise<Result<Milestone>> {
  // Read current state first
  const { data: current, error: fetchErr } = await supabase
    .from('milestones')
    .select('is_completed')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchErr) return err(fetchErr.message)

  const nowCompleted = !current.is_completed
  const update: Record<string, unknown> = {
    is_completed: nowCompleted,
    completed_at: nowCompleted ? new Date().toISOString() : null,
  }

  const { data: milestone, error: e } = await supabase
    .from('milestones')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (e) return err(e.message)
  return ok(milestone as Milestone)
}

export async function reorderMilestones(
  supabase:   SupabaseClient,
  userId:     string,
  orderedIds: string[],
): Promise<Result<void>> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('milestones')
      .update({ order_index: index })
      .eq('id', id)
      .eq('user_id', userId),
  )

  await Promise.all(updates)
  return ok(undefined)
}
