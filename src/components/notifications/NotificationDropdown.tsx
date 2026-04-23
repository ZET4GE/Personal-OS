'use client'

import Link from 'next/link'
import { AlertTriangle, Check, CheckCheck, Info, Trash2 } from 'lucide-react'
import type { SmartAlert } from '@/types/dashboard'
import type { Notification } from '@/types/notifications'
import { NotificationItem } from './NotificationItem'
import { markAllAsReadAction, deleteAllReadAction } from '@/app/(dashboard)/notifications/actions'

interface Props {
  notifications: Notification[]
  loading: boolean
  onRead: (id: string) => void
  onDelete: (id: string) => void
  onReadAll: () => void
  onClose: () => void
  smartAlerts?: SmartAlert[]
  onDismissAlert?: (alertId: string) => void
}

export function NotificationDropdown({
  notifications,
  loading,
  onRead,
  onDelete,
  onReadAll,
  onClose,
  smartAlerts = [],
  onDismissAlert,
}: Props) {
  const hasUnread = notifications.some((item) => !item.is_read)
  const hasRead = notifications.some((item) => item.is_read)

  async function handleReadAll() {
    onReadAll()
    await markAllAsReadAction()
  }

  async function handleDeleteAllRead() {
    await deleteAllReadAction()
    window.location.reload()
  }

  return (
    <div className="w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <button
              onClick={handleReadAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-500 transition-colors hover:bg-accent-500/10"
              title="Marcar todas como leidas"
            >
              <CheckCheck size={13} />
              <span>Leer todo</span>
            </button>
          )}
          {hasRead && (
            <button
              onClick={handleDeleteAllRead}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text/40 transition-colors hover:bg-surface-2 hover:text-text/70"
              title="Borrar leidas"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-1">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex gap-3 rounded-lg px-3 py-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-surface-3" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-surface-3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 && smartAlerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-text/40">
            <CheckCheck size={32} strokeWidth={1.5} />
            <p className="text-sm">Todo al dia</p>
          </div>
        ) : (
          <div className="space-y-2">
            {smartAlerts.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-2 p-2">
                <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Alertas inteligentes
                </p>
                <div className="space-y-1">
                  {smartAlerts.map((alert) => {
                    const isWarning = alert.type === 'warning'
                    const Icon = isWarning ? AlertTriangle : Info

                    return (
                      <div
                        key={alert.id}
                        className={[
                          'rounded-lg px-2.5 py-2 text-xs',
                          isWarning
                            ? 'bg-red-500/10 text-red-700 dark:text-red-100'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-100',
                        ].join(' ')}
                      >
                        <Link
                          href={isWarning ? '/goals' : '/habits'}
                          onClick={onClose}
                          className="flex items-start gap-2 transition-colors hover:opacity-80"
                        >
                          <Icon size={14} className={isWarning ? 'mt-0.5 shrink-0 text-red-400' : 'mt-0.5 shrink-0 text-amber-400'} />
                          <span className="leading-5">{alert.message}</span>
                        </Link>
                        {onDismissAlert && (
                          <button
                            onClick={() => onDismissAlert(alert.id)}
                            className={[
                              'mt-1.5 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors',
                              isWarning
                                ? 'text-red-600 hover:bg-red-500/15 dark:text-red-300'
                                : 'text-amber-600 hover:bg-amber-500/15 dark:text-amber-300',
                            ].join(' ')}
                          >
                            <Check size={11} />
                            Resolver por hoy
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={onRead}
                onDelete={onDelete}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {(notifications.length > 0 || smartAlerts.length > 0) && (
        <div className="border-t border-border px-4 py-2.5">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block text-center text-xs text-accent-500 transition-colors hover:text-accent-600"
          >
            Ver todas las notificaciones
          </Link>
        </div>
      )}
    </div>
  )
}
