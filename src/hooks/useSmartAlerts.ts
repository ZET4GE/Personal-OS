'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SmartAlert } from '@/types/dashboard'

interface UseSmartAlertsResult {
  alerts: SmartAlert[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useSmartAlerts(): UseSmartAlertsResult {
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
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
      setAlerts([])
      setError('Sesion no valida')
      setLoading(false)
      return
    }

    const { data, error: rpcError } = await supabase.rpc('get_smart_alerts', {
      p_user_id: user.id,
    })

    if (rpcError) {
      setAlerts([])
      setError(rpcError.message)
      setLoading(false)
      return
    }

    setAlerts((data ?? []) as SmartAlert[])
    setLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    const handleFocus = () => {
      void refresh()
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refresh()
      }
    }

    const handleCustomRefresh = () => {
      void refresh()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('smart-alerts:refresh', handleCustomRefresh)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('smart-alerts:refresh', handleCustomRefresh)
    }
  }, [])

  return { alerts, loading, error, refresh }
}
