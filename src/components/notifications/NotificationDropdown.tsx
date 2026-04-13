'use client'

import Link from 'next/link'
import { CheckCheck, Trash2 } from 'lucide-react'
import type { Notification } from '@/types/notifications'
import { NotificationItem } from './NotificationItem'
import { markAllAsReadAction, deleteAllReadAction } from '@/app/(dashboard)/notifications/actions'

interface Props {
  notifications:    Notification[]
  loading:          boolean
  onRead:           (id: string) => void
  onDelete:         (id: string) => void
  onReadAll:        () => void
  onClose:          () => void
}

export function NotificationDropdown({
  notifications,
  loading,
  onRead,
  onDelete,
  onReadAll,
  onClose,
}: Props) {
  const hasUnread = notifications.some((n) => !n.is_read)
  const hasRead   = notifications.some((n) => n.is_read)

  async function handleReadAll() {
    onReadAll()
    await markAllAsReadAction()
  }

  async function handleDeleteAllRead() {
    await deleteAllReadAction()
    // let page revalidate — items will disappear on next fetch
    window.location.reload()
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card-hover)]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <button
              onClick={handleReadAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-500 transition-colors hover:bg-accent-500/10"
              title="Marcar todas como leídas"
            >
              <CheckCheck size={13} />
              <span>Leer todo</span>
            </button>
          )}
          {hasRead && (
            <button
              onClick={handleDeleteAllRead}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text/40 transition-colors hover:bg-surface-2 hover:text-text/70"
              title="Borrar las leídas"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* list */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg px-3 py-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-surface-3" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-surface-3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-text/40">
            <CheckCheck size={32} strokeWidth={1.5} />
            <p className="text-sm">Todo al día</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={onRead}
                onDelete={onDelete}
                compact
              />
            ))}
          </div>
        )}
      </div>

      {/* footer */}
      {notifications.length > 0 && (
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
