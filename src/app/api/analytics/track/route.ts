import { createAdminClient } from '@/lib/supabase/admin'
import { trackPageView } from '@/services/analytics'
import { PAGE_TYPES, type PageType } from '@/types/analytics'

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

async function getVerifiedOwnerId(
  supabase: ReturnType<typeof createAdminClient>,
  pageType: PageType,
  pageId: string | null,
  ownerId: string,
) {
  if (pageType === 'profile' || pageType === 'cv') {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', ownerId)
      .eq('is_public', true)
      .maybeSingle()

    return data?.id ?? null
  }

  if (pageType === 'project') {
    if (!pageId) return null

    const { data } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', pageId)
      .eq('user_id', ownerId)
      .eq('is_public', true)
      .maybeSingle()

    return data?.user_id ?? null
  }

  if (pageType === 'post') {
    if (!pageId) return null

    const { data } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', pageId)
      .eq('user_id', ownerId)
      .eq('status', 'published')
      .maybeSingle()

    return data?.user_id ?? null
  }

  return null
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
    const pageType = page_type as PageType

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

    const supabase = createAdminClient()
    const verifiedOwnerId = await getVerifiedOwnerId(
      supabase,
      pageType,
      typeof page_id === 'string' ? page_id : null,
      owner_id,
    )

    if (!verifiedOwnerId) {
      return Response.json({ error: 'Page not found' }, { status: 404 })
    }

    await trackPageView(supabase, {
      userId:    verifiedOwnerId,
      pageType,
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
