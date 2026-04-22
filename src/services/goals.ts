import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal, GoalWithMilestones, GoalStats, GoalStatus, GoalCategory } from '@/types/goals'
import type { CreateGoalData, UpdateGoalData } from '@/lib/validations/goals'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export async function getGoals(
  supabase:  SupabaseClient,
  userId:    string,
  opts: {
    status?:   GoalStatus
    category?: GoalCategory
  } = {},
): Promise<Result<Goal[]>> {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (opts.status)   query = query.eq('status', opts.status)
  if (opts.category) query = query.eq('category', opts.category)

  const { data, error: e } = await query
  if (e) return err(e.message)
  return ok(data as Goal[])
}

export async function getGoal(
  supabase: SupabaseClient,
  userId:   string,
  id:       string,
): Promise<Result<GoalWithMilestones>> {
  const { data, error: e } = await supabase
    .from('goals')
    .select(`
      *,
      milestones(* ),
      goal_updates(* )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .order('order_index', { referencedTable: 'milestones', ascending: true })
    .order('created_at',  { referencedTable: 'goal_updates', ascending: false })
    .single()

  if (e) return err(e.message)
  return ok(data as GoalWithMilestones)
}

export async function getTopGoals(
  supabase: SupabaseClient,
  userId:   string,
  limit = 3,
): Promise<Result<Goal[]>> {
  const { data, error: e } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (e) return err(e.message)
  return ok(data as Goal[])
}

export async function getGoalStats(
  supabase: SupabaseClient,
  userId:   string,
): Promise<Result<GoalStats>> {
  const { data, error: e } = await supabase
    .from('goals')
    .select('status, progress')
    .eq('user_id', userId)

  if (e) return err(e.message)

  const goals = data as { status: string; progress: number }[]
  const total     = goals.length
  const active    = goals.filter((g) => g.status === 'active').length
  const completed = goals.filter((g) => g.status === 'completed').length
  const paused    = goals.filter((g) => g.status === 'paused').length
  const avgProgress = total > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total)
    : 0

  return ok({ total, active, completed, paused, avgProgress })
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

export async function createGoal(
  supabase: SupabaseClient,
  userId:   string,
  data:     CreateGoalData,
): Promise<Result<Goal>> {
  const { data: goal, error: e } = await supabase
    .from('goals')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (e) return err(e.message)
  return ok(goal as Goal)
}

export async function updateGoal(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
  data:     Omit<UpdateGoalData, 'id'>,
): Promise<Result<Goal>> {
  const { data: goal, error: e } = await supabase
    .from('goals')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (e) return err(e.message)
  return ok(goal as Goal)
}

export async function deleteGoal(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
): Promise<Result<void>> {
  const { error: e } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (e) return err(e.message)
  return ok(undefined)
}

export async function toggleGoalStatus(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
  status:   GoalStatus,
): Promise<Result<Goal>> {
  const update: Record<string, unknown> = { status }
  if (status === 'completed') {
    update.completed_at = new Date().toISOString()
    update.progress = 100
  }

  const { data: goal, error: e } = await supabase
    .from('goals')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (e) return err(e.message)
  return ok(goal as Goal)
}
