'use client'

import { useEffect, useState } from 'react'
import { getGoalProgress, type GoalProgressData } from '@/services/goal-progress'

interface UseGoalProgressResult {
  progress: GoalProgressData
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const EMPTY_PROGRESS: GoalProgressData = {
  progress: 0,
  habits_progress: 0,
  projects_progress: 0,
  routines_progress: 0,
}

export function useGoalProgress(goalId: string): UseGoalProgressResult {
  const [progress, setProgress] = useState<GoalProgressData>(EMPTY_PROGRESS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    const result = await getGoalProgress(goalId)

    if (result.error) {
      setProgress(EMPTY_PROGRESS)
      setError(result.error)
    } else {
      setProgress(result.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        setError(null)

        const result = await getGoalProgress(goalId)

        if (result.error) {
          setProgress(EMPTY_PROGRESS)
          setError(result.error)
        } else {
          setProgress(result.data)
        }

        setLoading(false)
      })()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [goalId])

  return { progress, loading, error, refresh }
}
