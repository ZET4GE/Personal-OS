'use client'

import { createClient } from '@/lib/supabase/client'
import { getGoals } from '@/services/goals'
import { getProjects } from '@/services/projects'
import type { TimeEntry, TimerTargetOption } from '@/types/time-entries'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> {
  return { data, error: null }
}

function err(message: string): Err {
  return { data: null, error: message }
}

interface CreateTimeEntryInput {
  projectId?: string | null
  goalId?: string | null
  description?: string
  startedAt: string
  endedAt: string
  duration: number
}

export async function getTimerTargets(): Promise<Result<{ projects: TimerTargetOption[]; goals: TimerTargetOption[] }>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return err(userError?.message || 'Sesion no valida')

  const [projectsResult, goalsResult] = await Promise.all([
    getProjects(supabase),
    getGoals(supabase, user.id),
  ])

  if (projectsResult.error) return err(projectsResult.error)
  if (goalsResult.error) return err(goalsResult.error)

  return ok({
    projects: (projectsResult.data ?? []).map((project) => ({
      id: project.id,
      label: project.title,
    })),
    goals: (goalsResult.data ?? []).map((goal) => ({
      id: goal.id,
      label: goal.title,
    })),
  })
}

export async function createTimeEntry(input: CreateTimeEntryInput): Promise<Result<TimeEntry>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return err(userError?.message || 'Sesion no valida')

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      project_id: input.projectId ?? null,
      goal_id: input.goalId ?? null,
      description: input.description?.trim() || null,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      duration: input.duration,
    })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as TimeEntry)
}

