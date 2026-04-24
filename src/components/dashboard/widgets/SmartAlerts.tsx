'use client'

import Link from 'next/link'
import { AlertTriangle, Check, ChevronRight, Info } from 'lucide-react'
import { useSmartAlerts } from '@/hooks/useSmartAlerts'

function getAlertStyles(type: 'warning' | 'info') {
  if (type === 'warning') {
    return {
      icon: AlertTriangle,
      className: 'border-red-500/20 bg-red-500/8 text-red-200',
      badge: 'text-red-400',
      dismissClass: 'text-red-300 hover:bg-red-500/15',
      href: '/goals',
      action: 'Revisar metas',
    }
  }

  return {
    icon: Info,
    className: 'border-amber-500/20 bg-amber-500/8 text-amber-100',
    badge: 'text-amber-400',
    dismissClass: 'text-amber-300 hover:bg-amber-500/15',
    href: '/habits',
    action: 'Ir a hábitos',
  }
}

export function SmartAlerts() {
  const { alerts, loading, error, dismissAlert } = useSmartAlerts()

  if (loading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="space-y-3">
          <div className="h-4 w-36 animate-pulse rounded bg-surface-hover" />
          <div className="h-14 animate-pulse rounded-xl bg-surface-hover" />
        </div>
      </section>
    )
  }

  if (error || alerts.length === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text">Alertas inteligentes</h2>
          <p className="text-xs text-muted">Señales rápidas según tu actividad reciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-3">
        {alerts.map((alert) => {
          const config = getAlertStyles(alert.type)
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={`animate-fade-in rounded-lg border px-3 py-3 ${config.className}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 ${config.badge}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{alert.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href={config.href}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-white/80 transition-colors hover:text-white"
                    >
                      {config.action}
                      <ChevronRight size={12} />
                    </Link>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${config.dismissClass}`}
                    >
                      <Check size={11} />
                      Resolver por hoy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
