'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TimerState } from '@/types/time-entries'

const TIMER_STORAGE_KEY = 'personal-os:floating-timer:v2'

function getDefaultPosition() {
  if (typeof window === 'undefined') {
    return { x: 24, y: 96 }
  }

  return {
    x: Math.max(16, window.innerWidth - 360),
    y: Math.max(88, window.innerHeight - 240),
  }
}

function createInitialState(): TimerState {
  return {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    mode: 'tracking',
    minimized: false,
    hidden: true,
    transparency: 0.94,
    position: getDefaultPosition(),
    countdownMinutes: 30,
    countdownDuration: 30 * 60 * 1000,
    finishedAt: null,
  }
}

function getStoredTimerState(): TimerState {
  const baseState = createInitialState()
  if (typeof window === 'undefined') return baseState

  const raw = window.localStorage.getItem(TIMER_STORAGE_KEY)
  if (!raw) return baseState

  try {
    const parsed = JSON.parse(raw) as Partial<TimerState>
    const countdownMinutes = Math.max(1, parsed.countdownMinutes ?? baseState.countdownMinutes)
    const countdownDuration = parsed.countdownDuration ?? countdownMinutes * 60 * 1000
    const startTime = parsed.startTime ?? null
    const elapsedTime = parsed.elapsedTime ?? 0
    const mode = parsed.mode === 'countdown' ? 'countdown' : 'tracking'
    const finishedAt = parsed.finishedAt ?? null

    let normalizedElapsed = elapsedTime
    let normalizedRunning = parsed.isRunning ?? false
    let normalizedFinishedAt = finishedAt

    if (normalizedRunning && startTime) {
      normalizedElapsed = Date.now() - startTime

      if (mode === 'countdown' && normalizedElapsed >= countdownDuration) {
        normalizedElapsed = countdownDuration
        normalizedRunning = false
        normalizedFinishedAt = finishedAt ?? Date.now()
      }
    }

    return {
      isRunning: normalizedRunning,
      startTime,
      elapsedTime: normalizedElapsed,
      mode,
      minimized: parsed.minimized ?? false,
      hidden: parsed.hidden ?? true,
      transparency: Math.min(1, Math.max(0.45, parsed.transparency ?? baseState.transparency)),
      position: parsed.position ?? baseState.position,
      countdownMinutes,
      countdownDuration,
      finishedAt: normalizedFinishedAt,
    }
  } catch {
    window.localStorage.removeItem(TIMER_STORAGE_KEY)
    return baseState
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

        const elapsedTime = Date.now() - current.startTime

        if (current.mode === 'countdown' && elapsedTime >= current.countdownDuration) {
          return {
            ...current,
            isRunning: false,
            elapsedTime: current.countdownDuration,
            finishedAt: current.finishedAt ?? Date.now(),
            minimized: false,
            hidden: false,
          }
        }

        return {
          ...current,
          elapsedTime,
        }
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timer.isRunning, timer.startTime])

  const displayTime = useMemo(() => {
    if (timer.mode === 'countdown') {
      return Math.max(0, timer.countdownDuration - timer.elapsedTime)
    }

    return timer.elapsedTime
  }, [timer.countdownDuration, timer.elapsedTime, timer.mode])

  const formattedTime = useMemo(() => formatElapsedTime(displayTime), [displayTime])

  function startTimer() {
    setTimer((current) => {
      if (current.isRunning) return current

      const baseElapsed = current.mode === 'countdown'
        ? Math.min(current.elapsedTime, current.countdownDuration)
        : current.elapsedTime

      return {
        isRunning: true,
        startTime: Date.now() - baseElapsed,
        elapsedTime: baseElapsed,
        mode: current.mode,
        minimized: current.minimized,
        hidden: false,
        transparency: current.transparency,
        position: current.position,
        countdownMinutes: current.countdownMinutes,
        countdownDuration: current.countdownDuration,
        finishedAt: null,
      }
    })
  }

  function stopTimer() {
    if (!timer.isRunning || !timer.startTime) {
      return timer
    }

    const snapshot = {
      ...timer,
      isRunning: false,
      elapsedTime: Date.now() - timer.startTime,
    }

    setTimer(snapshot)
    return snapshot
  }

  function resetTimer() {
    setTimer((current) => ({
      ...current,
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      finishedAt: null,
    }))
  }

  function setMode(mode: TimerState['mode']) {
    setTimer((current) => {
      if (current.isRunning) return current

      return {
        ...current,
        mode,
        elapsedTime: 0,
        startTime: null,
        finishedAt: null,
      }
    })
  }

  function setMinimized(minimized: boolean) {
    setTimer((current) => ({ ...current, minimized }))
  }

  function setHidden(hidden: boolean) {
    setTimer((current) => ({ ...current, hidden }))
  }

  function setPosition(position: TimerState['position']) {
    setTimer((current) => ({ ...current, position }))
  }

  function setTransparency(transparency: number) {
    setTimer((current) => ({
      ...current,
      transparency: Math.min(1, Math.max(0.45, transparency)),
    }))
  }

  function setCountdownMinutes(minutes: number) {
    const safeMinutes = Math.max(1, Math.floor(minutes) || 1)

    setTimer((current) => {
      if (current.isRunning) return current

      return {
        ...current,
        countdownMinutes: safeMinutes,
        countdownDuration: safeMinutes * 60 * 1000,
        elapsedTime: 0,
        startTime: null,
        finishedAt: null,
      }
    })
  }

  function clearFinished() {
    setTimer((current) => ({ ...current, finishedAt: null }))
  }

  return {
    isRunning: timer.isRunning,
    startTime: timer.startTime,
    elapsedTime: timer.elapsedTime,
    mode: timer.mode,
    minimized: timer.minimized,
    hidden: timer.hidden,
    transparency: timer.transparency,
    position: timer.position,
    countdownMinutes: timer.countdownMinutes,
    countdownDuration: timer.countdownDuration,
    finishedAt: timer.finishedAt,
    displayTime,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
    setMode,
    setMinimized,
    setHidden,
    setPosition,
    setTransparency,
    setCountdownMinutes,
    clearFinished,
  }
}
