'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-all duration-150 hover:bg-surface-hover hover:text-foreground active:scale-90"
    >
      {/* Sun icon — visible in dark mode (click → go light) */}
      <Sun
        size={16}
        className={[
          'absolute transition-all duration-300',
          isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-75',
        ].join(' ')}
      />
      {/* Moon icon — visible in light mode (click → go dark) */}
      <Moon
        size={16}
        className={[
          'absolute transition-all duration-300',
          isDark
            ? 'opacity-0 -rotate-90 scale-75'
            : 'opacity-100 rotate-0 scale-100',
        ].join(' ')}
      />
    </button>
  )
}
