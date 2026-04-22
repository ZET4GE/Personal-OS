'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGoals } from '@/services/goals'
import type { GoalProgressData } from '@/services/goal-progress'
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

function withVisibleProgress(goal: Goal): UserGoal {
  const progress = Math.max(0, Math.min(1, Number(goal.progress ?? 0) / 100))

  return {
    ...goal,
    goal_progress: {
      progress,
      habits_progress: progress,
      projects_progress: progress,
      routines_progress: progress,
    },
  }
}

export function useUserGoals(initialGoals?: Goal[]): UseUserGoalsResult {
  const hasInitialGoals = initialGoals !== undefined
  const [goals, setGoals] = useState<UserGoal[]>(() => (initialGoals ?? []).map(withVisibleProgress))
  const [loading, setLoading] = useState(!hasInitialGoals)
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
      setGoals((result.data ?? []).map(withVisibleProgress))
    }

    setLoading(false)
  }

  useEffect(() => {
    if (hasInitialGoals) return

    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [hasInitialGoals])

  return { goals, loading, error, refresh }
}
