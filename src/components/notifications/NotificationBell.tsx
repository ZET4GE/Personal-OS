'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useSmartAlerts } from '@/hooks/useSmartAlerts'
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
  const { alerts: smartAlerts } = useSmartAlerts()

  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  // close on outside click
  useEffect(() => {
    if (!isOpen) return

    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
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
        aria-label={`Notificaciones${unreadCount + smartAlerts.length > 0 ? ` (${unreadCount + smartAlerts.length})` : ''}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text/60 transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Bell size={18} />

        {unreadCount + smartAlerts.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white leading-none">
            {unreadCount + smartAlerts.length > 99 ? '99+' : unreadCount + smartAlerts.length}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(
        <div ref={dropdownRef} className="fixed right-3 top-14 z-[100000] pointer-events-auto sm:right-4">
          <NotificationDropdown
            notifications={notifications}
            loading={loading}
            onRead={optimisticRead}
            onDelete={optimisticDelete}
            onReadAll={optimisticReadAll}
            onClose={close}
            smartAlerts={smartAlerts}
          />
        </div>,
        document.body,
      )}
    </div>
  )
}
