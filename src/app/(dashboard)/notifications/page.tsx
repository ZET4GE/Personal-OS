import type { Metadata } from 'next'
import { CheckCheck, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/services/notifications'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { Notification } from '@/types/notifications'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'
import { DeleteAllReadButton } from '@/components/notifications/DeleteAllReadButton'

export const metadata: Metadata = { title: 'Notificaciones' }

// ─────────────────────────────────────────────────────────────
// Date grouping
// ─────────────────────────────────────────────────────────────

type Group = { label: string; items: Notification[] }

function groupByDate(notifications: Notification[]): Group[] {
  const now   = new Date()
  const today = now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const groups: Record<string, Notification[]> = {
    Hoy:           [],
    Ayer:          [],
    'Esta semana': [],
    Anteriores:    [],
  }

  for (const n of notifications) {
    const d    = new Date(n.created_at)
    const dStr = d.toDateString()

    if (dStr === today)           groups['Hoy'].push(n)
    else if (dStr === yesterdayStr) groups['Ayer'].push(n)
    else if (d >= weekAgo)        groups['Esta semana'].push(n)
    else                          groups['Anteriores'].push(n)
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }))
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const notifications = user
    ? await getNotifications(supabase, user.id, false, 100)
    : []

  const groups    = groupByDate(notifications)
  const hasUnread = notifications.some((n) => !n.is_read)
  const hasRead   = notifications.some((n) => n.is_read)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          <p className="text-sm text-muted">
            {notifications.length === 0
              ? 'Todo al día'
              : `${notifications.filter((n) => !n.is_read).length} sin leer · ${notifications.length} en total`}
          </p>
        </div>

        {(hasUnread || hasRead) && (
          <div className="flex gap-2">
            {hasUnread && <MarkAllReadButton />}
            {hasRead   && <DeleteAllReadButton />}
          </div>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <Bell size={32} strokeWidth={1.5} className="text-muted" />
          <div>
            <p className="font-medium">Sin notificaciones</p>
            <p className="mt-1 text-sm text-muted">Cuando ocurra algo importante, aparecerá aquí.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <section key={label}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text/40">
                {label}
              </h3>
              <div className="space-y-0.5 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-card)]">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
