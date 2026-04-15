'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDynamicCV } from '@/services/dynamic-cv'
import type { DynamicCV } from '@/types/cv'

const EMPTY_DYNAMIC_CV: DynamicCV = {
  experience: [],
  projects: [],
  skills: [],
}

interface UseDynamicCVResult {
  data: DynamicCV
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDynamicCV(): UseDynamicCVResult {
  const [data, setData] = useState<DynamicCV>(EMPTY_DYNAMIC_CV)
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
      setData(EMPTY_DYNAMIC_CV)
      setError('Sesion no valida')
      setLoading(false)
      return
    }

    const result = await getDynamicCV(user.id)

    if (result.error) {
      setData(EMPTY_DYNAMIC_CV)
      setError(result.error)
    } else {
      setData(result.data ?? EMPTY_DYNAMIC_CV)
    }

    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  return { data, loading, error, refresh }
}
