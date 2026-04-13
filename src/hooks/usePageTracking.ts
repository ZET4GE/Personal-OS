'use client'

import { useEffect } from 'react'
import type { PageType } from '@/types/analytics'

interface TrackOptions {
  pageType:       PageType
  pageId?:        string | null   // ID del proyecto si aplica
  ownerId:        string          // UUID del dueño del perfil
  currentUserId?: string | null   // UUID del visitante autenticado (para skip owner)
}

// ─────────────────────────────────────────────────────────────
// usePageTracking
//
// Dispara un POST a /api/analytics/track al montar el componente.
// Garantías:
//   - No trackea si el visitante es el dueño del contenido.
//   - No trackea dos veces la misma página en la misma sesión
//     (usa sessionStorage como dedup key).
//   - Fire-and-forget: no bloquea el renderizado.
// ─────────────────────────────────────────────────────────────

export function usePageTracking({ pageType, pageId, ownerId, currentUserId }: TrackOptions) {
  useEffect(() => {
    // No trackear si el visitante es el dueño
    if (currentUserId && currentUserId === ownerId) return

    // Dedup por sesión de navegación
    const dedupKey = `pv:${pageType}:${pageId ?? ''}:${ownerId}`
    try {
      if (sessionStorage.getItem(dedupKey)) return
      sessionStorage.setItem(dedupKey, '1')
    } catch {
      // sessionStorage puede estar bloqueado (modo incógnito estricto)
    }

    fetch('/api/analytics/track', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        page_type: pageType,
        page_id:   pageId ?? null,
        owner_id:  ownerId,
      }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
