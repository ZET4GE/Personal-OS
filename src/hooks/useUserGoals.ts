'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGoals } from '@/services/goals'
import { getGoalProgress, type GoalProgressData } from '@/services/goal-progress'
import type { Goal } from '@/types/goals'

export interface UserGoal extends Goal {
  goal_progress: GoalProgressData
}

interface UseUserGoalsResult {
  goals: UserGoal[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserGoals(): UseUserGoalsResult {
  const [goals, setGoals] = useState<UserGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setGoals([])
      setError('Sesion no valida')
      setLoading(false)
      return
    }

    const result = await getGoals(supabase, user.id)

    if (result.error) {
      setGoals([])
      setError(result.error)
    } else {
      const baseGoals = result.data ?? []
      const progressResults = await Promise.all(
        baseGoals.map(async (goal) => {
          const progressResult = await getGoalProgress(goal.id)

          return {
            ...goal,
            goal_progress: progressResult.data ?? {
              progress: 0,
              habits_progress: 0,
              projects_progress: 0,
              routines_progress: 0,
            },
          }
        }),
      )

      setGoals(progressResults)
    }

    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  return { goals, loading, error, refresh }
}
