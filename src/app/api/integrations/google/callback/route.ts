import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { saveIntegration } from '@/services/integrations'

const SETTINGS_URL = '/settings/integrations'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const code    = searchParams.get('code')
  const state   = searchParams.get('state')
  const errParam = searchParams.get('error')

  if (errParam) {
    console.error('[google/callback] OAuth error:', errParam)
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=google_denied`, request.nextUrl.origin))
  }

  // ── State verification ───────────────────────────────────
  const cookieStore   = await cookies()
  const storedState   = cookieStore.get('oauth_state_google')?.value
  cookieStore.delete('oauth_state_google')

  if (!state || state !== storedState) {
    console.error('[google/callback] State mismatch')
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=invalid_state`, request.nextUrl.origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=no_code`, request.nextUrl.origin))
  }

  // ── Authenticate user ─────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
  }

  // ── Exchange code for tokens ──────────────────────────────
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    console.error('[google/callback] Token exchange failed:', text)
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=token_exchange`, request.nextUrl.origin))
  }

  const tokens = await tokenRes.json() as {
    access_token:  string
    refresh_token?: string
    expires_in:    number
    scope:         string
  }

  const token_expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // ── Fetch user email from Google ──────────────────────────
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const googleUser = userRes.ok
    ? (await userRes.json() as { id: string; email: string; name?: string })
    : null

  // ── Save integration ──────────────────────────────────────
  await saveIntegration(supabase, user.id, {
    provider:         'google',
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token ?? null,
    token_expires_at,
    scope:            tokens.scope,
    provider_user_id: googleUser?.id ?? null,
    provider_email:   googleUser?.email ?? null,
    metadata:         { name: googleUser?.name ?? null },
  })

  return NextResponse.redirect(new URL(`${SETTINGS_URL}?connected=google`, request.nextUrl.origin))
}
