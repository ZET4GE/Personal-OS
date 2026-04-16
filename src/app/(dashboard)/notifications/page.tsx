import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/services/notifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { Notification } from '@/types/notifications'
import type { SmartAlert } from '@/types/dashboard'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'
import { DeleteAllReadButton } from '@/components/notifications/DeleteAllReadButton'

export const metadata: Metadata = { title: 'Notificaciones' }

type Group = { label: string; items: Notification[] }

function groupByDate(notifications: Notification[]): Group[] {
  const now = new Date()
  const today = now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const groups: Record<string, Notification[]> = {
    Hoy: [],
    Ayer: [],
    'Esta semana': [],
    Anteriores: [],
  }

  for (const notification of notifications) {
    const date = new Date(notification.created_at)
    const dateStr = date.toDateString()

    if (dateStr === today) groups.Hoy.push(notification)
    else if (dateStr === yesterdayStr) groups.Ayer.push(notification)
    else if (date >= weekAgo) groups['Esta semana'].push(notification)
    else groups.Anteriores.push(notification)
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }))
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const notifications = user
    ? await getNotifications(supabase, user.id, false, 100)
    : []

  const { data: smartAlertsData } = user
    ? await supabase.rpc('get_smart_alerts', { p_user_id: user.id })
    : { data: [] }

  const smartAlerts = (smartAlertsData ?? []) as SmartAlert[]
  const groups = groupByDate(notifications)
  const unreadCount = notifications.filter((notification) => !notification.is_read).length
  const hasUnread = unreadCount > 0
  const hasRead = notifications.some((notification) => notification.is_read)
  const hasActivity = notifications.length > 0 || smartAlerts.length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <p className="text-sm text-muted">
            {!hasActivity
              ? 'Todo al dia'
              : `${unreadCount} sin leer · ${smartAlerts.length} alertas · ${notifications.length} eventos`}
          </p>
        </div>

        {(hasUnread || hasRead) && (
          <div className="flex gap-2">
            {hasUnread && <MarkAllReadButton />}
            {hasRead && <DeleteAllReadButton />}
          </div>
        )}
      </div>

      {!hasActivity ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <Bell size={32} strokeWidth={1.5} className="text-muted" />
          <div>
            <p className="font-medium">Sin notificaciones</p>
            <p className="mt-1 text-sm text-muted">Cuando ocurra algo importante, aparecera aqui.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {smartAlerts.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text/40">
                Alertas inteligentes
              </h3>
              <div className="space-y-2 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-card)]">
                {smartAlerts.map((alert, index) => {
                  const isWarning = alert.type === 'warning'
                  const Icon = isWarning ? AlertTriangle : Info

                  return (
                    <Link
                      key={`${alert.type}-${index}`}
                      href={isWarning ? '/goals' : '/habits'}
                      className={[
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                        isWarning
                          ? 'bg-red-500/10 text-red-100 hover:bg-red-500/15'
                          : 'bg-amber-500/10 text-amber-100 hover:bg-amber-500/15',
                      ].join(' ')}
                    >
                      <Icon size={16} className={isWarning ? 'text-red-400' : 'text-amber-400'} />
                      <span>{alert.message}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {groups.map(({ label, items }) => (
            <section key={label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text/40">
                {label}
              </h3>
              <div className="space-y-0.5 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-card)]">
                {items.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
