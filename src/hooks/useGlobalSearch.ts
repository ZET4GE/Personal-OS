'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GlobalSearchResult } from '@/types/search'

interface UseGlobalSearchResult {
  results: GlobalSearchResult[]
  loading: boolean
  error: string | null
}

export function useGlobalSearch(query: string): UseGlobalSearchResult {
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const normalizedQuery = query.trim()

  useEffect(() => {
    if (!normalizedQuery) {
      return
    }

    let active = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!active) return

      if (userError || !user) {
        setResults([])
        setError('Sesion no valida')
        setLoading(false)
        return
      }

      const { data, error: searchError } = await supabase.rpc('search_all', {
        p_user_id: user.id,
        p_query: normalizedQuery,
      })

      if (!active) return

      if (searchError) {
        setResults([])
        setError(searchError.message)
      } else {
        setResults((data ?? []) as GlobalSearchResult[])
      }

      setLoading(false)
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [normalizedQuery])

  return {
    results: normalizedQuery ? results : [],
    loading: normalizedQuery ? loading : false,
    error: normalizedQuery ? error : null,
  }
}
