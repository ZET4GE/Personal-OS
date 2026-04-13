'use client'

import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    loading,
    toggle,
    close,
    optimisticRead,
    optimisticReadAll,
    optimisticDelete,
  } = useNotifications()

  const containerRef = useRef<HTMLDivElement>(null)

  // close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, close])

  // close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text/60 transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          onRead={optimisticRead}
          onDelete={optimisticDelete}
          onReadAll={optimisticReadAll}
          onClose={close}
        />
      )}
    </div>
  )
}
