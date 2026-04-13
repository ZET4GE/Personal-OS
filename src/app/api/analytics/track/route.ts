import { createClient } from '@/lib/supabase/server'
import { trackPageView } from '@/services/analytics'
import { PAGE_TYPES } from '@/types/analytics'

// ─────────────────────────────────────────────────────────────
// POST /api/analytics/track
// Registra una vista de página de forma anónima y privacy-friendly.
// El fingerprint es un SHA-256 de IP + user-agent (no reversible).
// ─────────────────────────────────────────────────────────────

async function hashFingerprint(ip: string, ua: string): Promise<string> {
  const raw    = `${ip}|${ua}`
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return Response.json({ error: 'Bad request' }, { status: 400 })

    const { page_type, page_id, owner_id } = body as Record<string, unknown>

    // Validar campos requeridos
    if (typeof owner_id !== 'string' || !owner_id) {
      return Response.json({ error: 'Missing owner_id' }, { status: 400 })
    }
    if (!PAGE_TYPES.includes(page_type as never)) {
      return Response.json({ error: 'Invalid page_type' }, { status: 400 })
    }

    // Extraer headers
    const headers  = req.headers
    const forwarded = headers.get('x-forwarded-for') ?? ''
    const ip       = forwarded.split(',')[0]?.trim() || 'unknown'
    const ua       = headers.get('user-agent') ?? ''
    const referrer = headers.get('referer') ?? null

    // Geo — headers inyectados por Vercel en producción
    const country = headers.get('x-vercel-ip-country') ?? null
    const city    = headers.get('x-vercel-ip-city')    ?? null

    const visitorId = await hashFingerprint(ip, ua)

    const supabase = await createClient()

    await trackPageView(supabase, {
      userId:    owner_id,
      pageType:  page_type as 'profile' | 'project' | 'cv',
      pageId:    typeof page_id === 'string' ? page_id : null,
      visitorId,
      referrer,
      userAgent: ua || null,
      country,
      city,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
