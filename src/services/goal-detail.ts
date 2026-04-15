import type { SupabaseClient } from '@supabase/supabase-js'
import type { GoalWithMilestones } from '@/types/goals'
import type { Project } from '@/types/projects'
import type { Note } from '@/types/notes'
import type { Habit, Routine } from '@/types/habits'
import { getGoal } from '@/services/goals'

type GoalLinkRow = {
  entity_type: 'project' | 'habit' | 'routine' | 'note' | 'task' | 'skill'
  entity_id: string
}

export interface GoalDetailHabit extends Habit {
  today_completed: boolean
}

export interface GoalDetailRoutine extends Routine {
  today_completed: boolean
}

export interface GoalDetailData {
  goal: GoalWithMilestones
  projects: Project[]
  habits: GoalDetailHabit[]
  routines: GoalDetailRoutine[]
  notes: Note[]
}

export interface GoalDetailProgress {
  progress: number
  habits_progress: number
  projects_progress: number
  routines_progress: number
}

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

export async function getGoalDetail(
  supabase: SupabaseClient,
  goalId: string,
): Promise<Result<GoalDetailData>> {
  const goalResult = await getGoal(supabase, goalId)
  if (goalResult.error || !goalResult.data) {
    return err(goalResult.error ?? 'Meta no encontrada')
  }

  const goal = goalResult.data

  const { data: linkRows, error: linksError } = await supabase
    .from('goal_links')
    .select('entity_type, entity_id')
    .eq('goal_id', goalId)

  if (linksError) return err(linksError.message)

  const links = (linkRows ?? []) as GoalLinkRow[]
  const projectIds = links.filter((item) => item.entity_type === 'project').map((item) => item.entity_id)
  const habitIds = links.filter((item) => item.entity_type === 'habit').map((item) => item.entity_id)
  const routineIds = links.filter((item) => item.entity_type === 'routine').map((item) => item.entity_id)
  const noteIds = links.filter((item) => item.entity_type === 'note').map((item) => item.entity_id)
  const today = new Date().toISOString().slice(0, 10)

  const [
    projectsRes,
    habitsRes,
    routinesRes,
    notesRes,
    habitLogsRes,
    routineLogsRes,
  ] = await Promise.all([
    projectIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('projects')
          .select('*')
          .eq('user_id', goal.user_id)
          .in('id', projectIds),
    habitIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('habits')
          .select('*')
          .eq('user_id', goal.user_id)
          .in('id', habitIds),
    routineIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('routines')
          .select('*')
          .eq('user_id', goal.user_id)
          .in('id', routineIds),
    noteIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('notes')
          .select('*')
          .eq('user_id', goal.user_id)
          .in('id', noteIds),
    habitIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('habit_logs')
          .select('habit_id')
          .eq('user_id', goal.user_id)
          .eq('completed_at', today)
          .in('habit_id', habitIds),
    routineIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('routine_logs')
          .select('routine_id')
          .eq('user_id', goal.user_id)
          .eq('completed_at', today)
          .in('routine_id', routineIds),
  ])

  const firstError = [
    projectsRes.error,
    habitsRes.error,
    routinesRes.error,
    notesRes.error,
    habitLogsRes.error,
    routineLogsRes.error,
  ].find(Boolean)

  if (firstError) return err(firstError.message)

  const completedHabitIds = new Set((habitLogsRes.data ?? []).map((item) => String(item.habit_id)))
  const completedRoutineIds = new Set((routineLogsRes.data ?? []).map((item) => String(item.routine_id)))

  return ok({
    goal,
    projects: (projectsRes.data ?? []) as Project[],
    habits: ((habitsRes.data ?? []) as Habit[]).map((habit) => ({
      ...habit,
      today_completed: completedHabitIds.has(habit.id),
    })),
    routines: ((routinesRes.data ?? []) as Routine[]).map((routine) => ({
      ...routine,
      today_completed: completedRoutineIds.has(routine.id),
    })),
    notes: (notesRes.data ?? []) as Note[],
  })
}

export async function getGoalDetailProgress(
  supabase: SupabaseClient,
  goalId: string,
): Promise<Result<GoalDetailProgress>> {
  const { data, error } = await supabase.rpc('get_goal_progress', {
    p_goal_id: goalId,
  })

  if (error) return err(error.message)

  const row = Array.isArray(data) ? data[0] : data

  return ok({
    progress: Number(row?.progress ?? 0),
    habits_progress: Number(row?.habits_progress ?? 0),
    projects_progress: Number(row?.projects_progress ?? 0),
    routines_progress: Number(row?.routines_progress ?? 0),
  })
}
