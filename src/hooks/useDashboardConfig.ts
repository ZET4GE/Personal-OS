'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DashboardWidgetLayout } from '@/types/dashboard-config'

interface UseDashboardConfigResult {
  layout: DashboardWidgetLayout[]
  loading: boolean
  error: string | null
  setLayout: React.Dispatch<React.SetStateAction<DashboardWidgetLayout[]>>
}

function normalizeLayout(
  savedLayout: DashboardWidgetLayout[],
  defaultLayout: DashboardWidgetLayout[],
): DashboardWidgetLayout[] {
  const savedMap = new Map(savedLayout.map((item) => [item.id, item]))

  return defaultLayout
    .map((item, index) => {
      const saved = savedMap.get(item.id)
      return saved
        ? {
            ...item,
            ...saved,
            position: typeof saved.position === 'number' ? saved.position : index,
          }
        : item
    })
    .sort((a, b) => a.position - b.position)
}

export function useDashboardConfig(
  defaultLayout: DashboardWidgetLayout[],
): UseDashboardConfigResult {
  const [layout, setLayout] = useState<DashboardWidgetLayout[]>(defaultLayout)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const defaultKey = useMemo(() => JSON.stringify(defaultLayout), [defaultLayout])

  useEffect(() => {
    let active = true

    const loadConfig = async () => {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (!active) return

      if (userError || !user) {
        setError('Sesion no valida')
        setLoading(false)
        return
      }

      const { data, error: configError } = await supabase
        .from('user_dashboard_config')
        .select('layout')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (configError) {
        setError(configError.message)
        setLoading(false)
        return
      }

      const savedLayout = Array.isArray(data?.layout)
        ? (data.layout as DashboardWidgetLayout[])
        : []

      setLayout(normalizeLayout(savedLayout, defaultLayout))
      setLoading(false)
    }

    void loadConfig()

    return () => {
      active = false
    }
  }, [defaultKey, defaultLayout])

  useEffect(() => {
    if (loading) return

    const timer = window.setTimeout(async () => {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) return

      await supabase
        .from('user_dashboard_config')
        .upsert(
          {
            user_id: user.id,
            layout,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
    }, 350)

    return () => {
      window.clearTimeout(timer)
    }
  }, [layout, loading])

  return { layout, loading, error, setLayout }
}
