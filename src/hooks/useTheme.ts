'use client'

import { useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light' | 'system'

function resolveIsDark(theme: Theme): boolean {
  if (typeof window === 'undefined') return false
  if (theme === 'dark')  return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

function readSaved(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem('theme') as Theme | null) ?? 'system'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')

  // Hydrate from localStorage on mount
  useEffect(() => {
    setThemeState(readSaved())
  }, [])

  // Apply class whenever theme changes
  useEffect(() => {
    const isDark = resolveIsDark(theme)
    applyTheme(isDark)

    if (theme === 'system') {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  // Listen to OS preference when in system mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const isDark = resolveIsDark(prev)
      return isDark ? 'light' : 'dark'
    })
  }, [])

  const isDark = resolveIsDark(theme)

  return { theme, setTheme, toggleTheme, isDark }
}
