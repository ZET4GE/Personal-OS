'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleClick() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Volver al inicio"
      className={[
        'fixed bottom-6 right-6 z-40',
        'flex h-11 w-11 items-center justify-center rounded-full',
        'border bg-surface shadow-md text-muted',
        'transition-all duration-200 ease-out',
        'hover:scale-105 hover:text-[var(--public-accent)] hover:border-[var(--public-accent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-accent)]',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <ArrowUp size={18} />
    </button>
  )
}
