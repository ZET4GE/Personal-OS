'use client'

import { usePageTracking } from '@/hooks/usePageTracking'
import type { PageType } from '@/types/analytics'

interface TrackingPixelProps {
  pageType:       PageType
  pageId?:        string | null
  ownerId:        string
  currentUserId?: string | null
}

// Componente invisible — solo dispara el tracking al montar.
// Insertar en Server Components públicos pasando los IDs necesarios.
export function TrackingPixel(props: TrackingPixelProps) {
  usePageTracking(props)
  return null
}
