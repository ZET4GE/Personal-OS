'use client'

import { useState } from 'react'
import type { TechIconDescriptor } from '@/types/tech-stack'

const DEVICON_BASE    = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons'
const SIMPLEICONS_BASE = 'https://cdn.simpleicons.org'

// Deterministic hue from string — same slug always gets same color
function slugHue(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = slug.charCodeAt(i) + ((h << 5) - h)
    h |= 0
  }
  return Math.abs(h) % 360
}

function Initials({ name, size }: { name: string; size: number }) {
  const parts    = name.split(/[\s\-_.]+/).filter(Boolean)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()

  const hue = slugHue(name.toLowerCase())
  const bg  = `hsl(${hue},55%,42%)`

  return (
    <div
      aria-label={name}
      style={{
        width:          size,
        height:         size,
        borderRadius:   size * 0.2,
        background:     bg,
        color:          '#fff',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       size * 0.33,
        fontWeight:     700,
        flexShrink:     0,
        userSelect:     'none',
      }}
    >
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

interface TechIconProps {
  name: string
  icon: TechIconDescriptor
  size?: number
}

export function TechIcon({ name, icon, size = 40 }: TechIconProps) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'initials'>('primary')

  if (icon.type === 'none' || stage === 'initials') {
    return <Initials name={name} size={size} />
  }

  // Build primary URL
  const primarySrc = icon.type === 'devicon'
    ? `${DEVICON_BASE}/${icon.slug}/${icon.slug}-${icon.variant}.svg`
    : `${SIMPLEICONS_BASE}/${icon.slug}/475569`

  // For simpleicons: no secondary fallback, go straight to initials on error
  // For devicon: if 'original' fails try 'plain', then initials
  function handleError() {
    if (icon.type === 'devicon' && stage === 'primary' && icon.variant === 'original') {
      setStage('fallback')
    } else {
      setStage('initials')
    }
  }

  const src = (icon.type === 'devicon' && stage === 'fallback')
    ? `${DEVICON_BASE}/${icon.slug}/${icon.slug}-plain.svg`
    : primarySrc

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={handleError}
      style={{ objectFit: 'contain', flexShrink: 0 }}
      loading="lazy"
    />
  )
}
