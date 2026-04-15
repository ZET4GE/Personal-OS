'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TimerState } from '@/types/time-entries'

const TIMER_STORAGE_KEY = 'personal-os:global-timer'

const INITIAL_STATE: TimerState = {
  isRunning: false,
  startTime: null,
  elapsedTime: 0,
}

function getStoredTimerState(): TimerState {
  if (typeof window === 'undefined') return INITIAL_STATE

  const raw = window.localStorage.getItem(TIMER_STORAGE_KEY)
  if (!raw) return INITIAL_STATE

  try {
    const parsed = JSON.parse(raw) as Partial<TimerState>
    return {
      isRunning: parsed.isRunning ?? false,
      startTime: parsed.startTime ?? null,
      elapsedTime: parsed.elapsedTime ?? 0,
    }
  } catch {
    window.localStorage.removeItem(TIMER_STORAGE_KEY)
    return INITIAL_STATE
  }
}

export function formatElapsedTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function useTimer() {
  const [timer, setTimer] = useState<TimerState>(getStoredTimerState)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer))
  }, [timer])

  useEffect(() => {
    if (!timer.isRunning || !timer.startTime) return

    const interval = window.setInterval(() => {
      setTimer((current) => {
        if (!current.isRunning || !current.startTime) return current
        return {
          ...current,
          elapsedTime: Date.now() - current.startTime,
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timer.isRunning, timer.startTime])

  const formattedTime = useMemo(() => formatElapsedTime(timer.elapsedTime), [timer.elapsedTime])

  function startTimer() {
    setTimer((current) => {
      if (current.isRunning) return current

      const baseElapsed = current.elapsedTime
      return {
        isRunning: true,
        startTime: Date.now() - baseElapsed,
        elapsedTime: baseElapsed,
      }
    })
  }

  function stopTimer() {
    let snapshot = INITIAL_STATE

    setTimer((current) => {
      if (!current.isRunning || !current.startTime) {
        snapshot = current
        return current
      }

      const elapsedTime = Date.now() - current.startTime
      snapshot = {
        isRunning: false,
        startTime: current.startTime,
        elapsedTime,
      }

      return snapshot
    })

    return snapshot
  }

  function resetTimer() {
    setTimer(INITIAL_STATE)
  }

  return {
    isRunning: timer.isRunning,
    startTime: timer.startTime,
    elapsedTime: timer.elapsedTime,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
  }
}
