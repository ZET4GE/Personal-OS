'use client'

import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'

// ─────────────────────────────────────────────────────────────
// Types (exported so page.tsx files can build section arrays)
// ─────────────────────────────────────────────────────────────

export interface NavSection {
  id: string
  label: string
  icon?: ComponentType<{ size?: number; className?: string }>
}

interface PageNavigationProps {
  sections: NavSection[]
  ariaLabel?: string
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function PageNavigation({ sections, ariaLabel = 'Navegación' }: PageNavigationProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Among newly-intersecting entries, pick the one closest to top of viewport
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id)
        }
      },
      // Active zone: the band between 88px from top and 55% from bottom
      // — a section is "active" when its top edge enters this zone
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    )

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
    setActiveId(id)
    history.pushState(null, '', `#${id}`)
  }

  if (sections.length === 0) return null

  return (
    <>
      {/* ── Mobile: horizontal sticky bar ─────────────────────── */}
      <nav
        aria-label={ariaLabel}
        className="lg:hidden sticky top-12 z-30 border-b backdrop-blur-md"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
      >
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeId === section.id
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'flex shrink-0 items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap',
                  'border-b-2 transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                  'focus-visible:ring-[var(--public-accent)]',
                  isActive
                    ? 'border-[var(--public-accent)] text-[var(--public-accent)]'
                    : 'border-transparent text-muted hover:text-foreground',
                ].join(' ')}
              >
                {Icon && <Icon size={13} />}
                {section.label}
              </a>
            )
          })}
        </div>
      </nav>

      {/* ── Desktop: vertical sidebar ──────────────────────────── */}
      <nav
        aria-label={ariaLabel}
        className="hidden lg:block border-r"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="mb-1 select-none px-3 text-[10px] font-semibold uppercase tracking-widest text-muted/50">
          Secciones
        </p>
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeId === section.id
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              aria-current={isActive ? 'true' : undefined}
              className={[
                'flex items-center gap-2.5 px-3 py-2.5 text-sm',
                'border-l-2 rounded-r-lg transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                'focus-visible:ring-[var(--public-accent)]',
                isActive
                  ? 'border-[var(--public-accent)] text-[var(--public-accent)] font-medium'
                  : 'border-transparent text-muted hover:text-foreground hover:bg-white/5',
              ].join(' ')}
              style={isActive ? {
                backgroundColor: 'color-mix(in srgb, var(--public-accent) 12%, transparent)',
              } : undefined}
            >
              {Icon && <Icon size={15} className="shrink-0 opacity-80" />}
              <span className="truncate">{section.label}</span>
            </a>
          )
        })}
      </nav>
    </>
  )
}
