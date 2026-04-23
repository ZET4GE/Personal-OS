'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  distance?: number
}

export function Reveal({
  children,
  className,
  delayMs = 0,
  distance = 26,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={['landing-reveal', visible ? 'is-visible' : '', className ?? ''].join(' ').trim()}
      style={{
        transitionDelay: `${delayMs}ms`,
        ['--landing-reveal-distance' as string]: `${distance}px`,
      }}
    >
      {children}
    </div>
  )
}
