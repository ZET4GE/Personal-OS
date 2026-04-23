'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateAlertId } from '@/lib/utils'
import type { SmartAlert } from '@/types/dashboard'

interface RawAlert {
  type: 'warning' | 'info'
  message: string
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function alertStorageKey(alertId: string): string {
  return `dismissed_alert_${alertId}_${todayKey()}`
}

function isDismissedToday(alertId: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(alertStorageKey(alertId)) === '1'
}

interface UseSmartAlertsResult {
  alerts: SmartAlert[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  dismissAlert: (alertId: string) => void
}

export function useSmartAlerts(): UseSmartAlertsResult {
  const [rawAlerts, setRawAlerts] = useState<SmartAlert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
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
      setRawAlerts([])
      setError('Sesion no valida')
      setLoading(false)
      return
    }

    const { data, error: rpcError } = await supabase.rpc('get_smart_alerts', {
      p_user_id: user.id,
    })

    if (rpcError) {
      setRawAlerts([])
      setError(rpcError.message)
      setLoading(false)
      return
    }

    const withIds: SmartAlert[] = ((data ?? []) as RawAlert[]).map((raw) => ({
      id: generateAlertId(raw.type, raw.message),
      type: raw.type,
      message: raw.message,
    }))

    const initialDismissed = new Set<string>()
    for (const alert of withIds) {
      if (isDismissedToday(alert.id)) {
        initialDismissed.add(alert.id)
      }
    }

    setRawAlerts(withIds)
    setDismissed(initialDismissed)
    setLoading(false)
  }

  const dismissAlert = useCallback((alertId: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(alertStorageKey(alertId), '1')
    setDismissed((prev) => new Set([...prev, alertId]))
  }, [])

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

  const alerts = rawAlerts.filter((a) => !dismissed.has(a.id))

  return { alerts, loading, error, refresh, dismissAlert }
}
