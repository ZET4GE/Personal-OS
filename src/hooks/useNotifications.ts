'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Notification } from '@/types/notifications'

const POLL_INTERVAL = 60_000   // 60 s

interface UseNotificationsReturn {
  notifications:  Notification[]
  unreadCount:    number
  isOpen:         boolean
  loading:        boolean
  open:           () => void
  close:          () => void
  toggle:         () => void
  refresh:        () => void
  optimisticRead: (id: string) => void
  optimisticReadAll: () => void
  optimisticDelete:  (id: string) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [isOpen,        setIsOpen]        = useState(false)
  const [loading,       setLoading]       = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Fetch count (lightweight, runs every 60 s) ─────────────
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count', { cache: 'no-store' })
      if (res.ok) {
        const { count } = await res.json()
        setUnreadCount(count)
      }
    } catch { /* silently ignore */ }
  }, [])

  // ── Fetch full list (runs when dropdown opens) ──────────────
  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (res.ok) {
        const data: Notification[] = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      }
    } catch { /* silently ignore */ } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchCount()
    if (isOpen) fetchList()
  }, [fetchCount, fetchList, isOpen])

  // ── Polling setup ───────────────────────────────────────────
  useEffect(() => {
    fetchCount()
    timerRef.current = setInterval(fetchCount, POLL_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchCount])

  // ── Open / close ────────────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true)
    fetchList()
  }, [fetchList])

  const close = useCallback(() => setIsOpen(false), [])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  // ── Optimistic mutations (UI instant, server action in caller)
  const optimisticRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n),
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }, [])

  const optimisticReadAll = useCallback(() => {
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: now })))
    setUnreadCount(0)
  }, [])

  const optimisticDelete = useCallback((id: string) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target && !target.is_read) setUnreadCount((c) => Math.max(0, c - 1))
      return prev.filter((n) => n.id !== id)
    })
  }, [])

  return {
    notifications,
    unreadCount,
    isOpen,
    loading,
    open,
    close,
    toggle,
    refresh,
    optimisticRead,
    optimisticReadAll,
    optimisticDelete,
  }
}
