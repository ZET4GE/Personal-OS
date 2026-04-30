'use client'

import { useState } from 'react'

interface RevealFieldProps {
  value: string
  href?: string
  icon: React.FC<{ size?: number; className?: string }>
  label: string
  className?: string
}

export function RevealField({ value, href, icon: Icon, label, className = '' }: RevealFieldProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-muted ${className}`}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      <Icon size={13} className="shrink-0" />
      {revealed ? (
        href ? (
          <a
            href={href}
            className="transition-colors hover:text-foreground"
          >
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-label={`Mostrar ${label}`}
          className="cursor-pointer select-none tracking-widest transition-colors hover:text-foreground"
        >
          ••••••••
        </button>
      )}
    </div>
  )
}
