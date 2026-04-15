import { createClient } from '@/lib/supabase/client'

export interface GoalProgressData {
  progress: number
  habits_progress: number
  projects_progress: number
  routines_progress: number
}

type GoalProgressResult =
  | { data: GoalProgressData; error: null }
  | { data: null; error: string }

export async function getGoalProgress(goalId: string): Promise<GoalProgressResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_goal_progress', {
    p_goal_id: goalId,
  })

  if (error) return { data: null, error: error.message }

  const row = Array.isArray(data) ? data[0] : data

  return {
    data: {
      progress:          Number(row?.progress ?? 0),
      habits_progress:   Number(row?.habits_progress ?? 0),
      projects_progress: Number(row?.projects_progress ?? 0),
      routines_progress: Number(row?.routines_progress ?? 0),
    },
    error: null,
  }
}
