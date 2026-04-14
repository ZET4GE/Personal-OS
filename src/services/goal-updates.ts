import type { SupabaseClient } from '@supabase/supabase-js'
import type { GoalUpdate } from '@/types/goals'
import type { CreateGoalUpdateData } from '@/lib/validations/goals'

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

export async function getUpdates(
  supabase: SupabaseClient,
  goalId:   string,
): Promise<Result<GoalUpdate[]>> {
  const { data, error: e } = await supabase
    .from('goal_updates')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })

  if (e) return err(e.message)
  return ok(data as GoalUpdate[])
}

export async function createUpdate(
  supabase: SupabaseClient,
  userId:   string,
  data:     CreateGoalUpdateData,
): Promise<Result<GoalUpdate>> {
  const { data: update, error: e } = await supabase
    .from('goal_updates')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (e) return err(e.message)
  return ok(update as GoalUpdate)
}

export async function deleteUpdate(
  supabase: SupabaseClient,
  id:       string,
  userId:   string,
): Promise<Result<void>> {
  const { error: e } = await supabase
    .from('goal_updates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (e) return err(e.message)
  return ok(undefined)
}
