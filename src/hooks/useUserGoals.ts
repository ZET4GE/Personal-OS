'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGoals } from '@/services/goals'
import type { Goal } from '@/types/goals'

interface UseUserGoalsResult {
  goals: Goal[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserGoals(): UseUserGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([])
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
      setGoals(result.data ?? [])
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
