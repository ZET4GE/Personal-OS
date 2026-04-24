'use client'

import Link from 'next/link'
import {
  Clock,
  CreditCard,
  Flame,
  Bell,
  X,
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types/notifications'
import { PRIORITY_BORDER, PRIORITY_DOT } from '@/types/notifications'
import { markAsReadAction, deleteNotificationAction } from '@/app/(dashboard)/notifications/actions'

// ─────────────────────────────────────────────────────────────
// Icon by type
// ─────────────────────────────────────────────────────────────

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  deadline:     <Clock    size={16} />,
  payment:      <CreditCard size={16} />,
  habit_streak: <Flame    size={16} />,
  system:       <Bell     size={16} />,
}

const TYPE_ICON_BG: Record<NotificationType, string> = {
  deadline:     'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  payment:      'bg-green-100  text-green-600  dark:bg-green-900/30  dark:text-green-400',
  habit_streak: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  system:       'bg-blue-100   text-blue-600   dark:bg-blue-900/30   dark:text-blue-400',
}

// ─────────────────────────────────────────────────────────────
// Relative time
// ─────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h} h`
  const d = Math.floor(h / 24)
  return `Hace ${d} d`
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface Props {
  notification: Notification
  onRead?:   (id: string) => void
  onDelete?: (id: string) => void
  compact?:  boolean
}

export function NotificationItem({ notification: n, onRead, onDelete, compact = false }: Props) {
  const border = PRIORITY_BORDER[n.priority]
  const dot    = PRIORITY_DOT[n.priority]

  async function handleRead() {
    if (n.is_read) return
    onRead?.(n.id)
    await markAsReadAction(n.id)
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(n.id)
    await deleteNotificationAction(n.id)
  }

  const inner = (
    <div
      className={[
        'group relative flex gap-3 rounded-lg px-3 py-3 transition-colors',
        n.is_read
          ? 'bg-transparent hover:bg-surface-elevated'
          : 'bg-accent-500/5 hover:bg-accent-500/10',
        border,
      ].filter(Boolean).join(' ')}
      onClick={handleRead}
      role={n.link ? undefined : 'button'}
      tabIndex={n.link ? undefined : 0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleRead() }}
    >
      {/* icon */}
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_ICON_BG[n.type]}`}>
        {TYPE_ICON[n.type]}
      </span>

      {/* content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-sm font-medium leading-snug ${n.is_read ? 'text-text/70' : 'text-text'}`}>
            {n.title}
          </p>
          {/* unread dot */}
          {!n.is_read && (
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
          )}
        </div>

        {n.message && !compact && (
          <p className="mt-0.5 text-xs text-text/50 leading-relaxed line-clamp-2">
            {n.message}
          </p>
        )}

        <p className="mt-1 text-xs text-text/40">
          {relativeTime(n.created_at)}
        </p>
      </div>

      {/* delete button */}
      <button
        onClick={handleDelete}
        className="absolute right-2 top-2 hidden rounded p-0.5 text-text/30 transition-colors hover:bg-surface-hover hover:text-text/70 group-hover:flex"
        aria-label="Eliminar notificación"
      >
        <X size={14} />
      </button>
    </div>
  )

  if (n.link) {
    return (
      <Link href={n.link} onClick={handleRead} className="block">
        {inner}
      </Link>
    )
  }

  return inner
}
