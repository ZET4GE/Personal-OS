import type { SupabaseClient } from '@supabase/supabase-js'
import type { Integration, GoogleCalendarEvent } from '@/types/integrations'
import { isTokenExpired, updateTokens } from './integrations'

// ─────────────────────────────────────────────────────────────
// Token refresh
// ─────────────────────────────────────────────────────────────

interface RefreshedTokens {
  access_token:     string
  token_expires_at: string
}

async function refreshGoogleToken(
  supabase: SupabaseClient,
  integration: Integration,
): Promise<Integration> {
  if (!integration.refresh_token) throw new Error('No refresh_token available')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: integration.refresh_token,
    }),
  })

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)

  const json = await res.json() as { access_token: string; expires_in: number }
  const token_expires_at = new Date(Date.now() + json.expires_in * 1000).toISOString()

  await updateTokens(supabase, integration.user_id, 'google', {
    access_token: json.access_token,
    token_expires_at,
  })

  return { ...integration, access_token: json.access_token, token_expires_at }
}

// ─────────────────────────────────────────────────────────────
// Ensure valid token — refreshes if needed
// ─────────────────────────────────────────────────────────────

export async function ensureValidToken(
  supabase: SupabaseClient,
  integration: Integration,
): Promise<Integration> {
  if (!isTokenExpired(integration)) return integration
  return refreshGoogleToken(supabase, integration)
}

// ─────────────────────────────────────────────────────────────
// Fetch upcoming events
// ─────────────────────────────────────────────────────────────

export async function getUpcomingEvents(
  supabase: SupabaseClient,
  integration: Integration,
  maxResults = 8,
): Promise<GoogleCalendarEvent[]> {
  const valid = await ensureValidToken(supabase, integration)
  if (!valid.access_token) return []

  const timeMin = new Date().toISOString()
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.set('timeMin', timeMin)
  url.searchParams.set('maxResults', String(maxResults))
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('singleEvents', 'true')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${valid.access_token}` },
    next: { revalidate: 300 },   // cache 5 min
  })

  if (!res.ok) {
    console.error('[google-calendar] getUpcomingEvents:', res.status, await res.text())
    return []
  }

  const data = await res.json() as {
    items?: Array<{
      id:       string
      summary?: string
      start:    { dateTime?: string; date?: string }
      end:      { dateTime?: string; date?: string }
      htmlLink: string
      colorId?: string
      location?: string
    }>
  }

  return (data.items ?? []).map((e) => {
    const startRaw = e.start.dateTime ?? e.start.date ?? ''
    const endRaw   = e.end.dateTime   ?? e.end.date   ?? ''
    const allDay   = !e.start.dateTime

    return {
      id:       e.id,
      summary:  e.summary ?? '(Sin título)',
      start:    startRaw,
      end:      endRaw,
      allDay,
      htmlLink: e.htmlLink,
      colorId:  e.colorId,
      location: e.location ?? null,
    }
  })
}
