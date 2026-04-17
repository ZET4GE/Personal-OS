'use client'

import { useEffect, useMemo, useState } from 'react'
import { searchAdvanced } from '@/services/search'
import type { AdvancedSearchFilters, AdvancedSearchResult } from '@/types/search'

interface UseAdvancedSearchResult {
  results: AdvancedSearchResult[]
  loading: boolean
  error: string | null
  active: boolean
}

export function useAdvancedSearch(filters: AdvancedSearchFilters): UseAdvancedSearchResult {
  const [results, setResults] = useState<AdvancedSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedFilters = useMemo(
    () => ({
      query: filters.query.trim(),
      type: filters.type,
      tagId: filters.tagId,
      status: filters.status,
    }),
    [filters.query, filters.status, filters.tagId, filters.type],
  )

  const active = Boolean(
    normalizedFilters.query ||
    normalizedFilters.tagId ||
    normalizedFilters.type !== 'all' ||
    normalizedFilters.status !== 'all',
  )

  useEffect(() => {
    if (!active) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    let mounted = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      const result = await searchAdvanced(normalizedFilters)
      if (!mounted) return

      if (result.error) {
        setResults([])
        setError(result.error)
      } else {
        setResults(result.data ?? [])
      }

      setLoading(false)
    }, 300)

    return () => {
      mounted = false
      window.clearTimeout(timer)
    }
  }, [active, normalizedFilters])

  return { results, loading: active ? loading : false, error: active ? error : null, active }
}
