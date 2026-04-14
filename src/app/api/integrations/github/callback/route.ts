import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { saveIntegration } from '@/services/integrations'

const SETTINGS_URL = '/settings/integrations'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl
  const code     = searchParams.get('code')
  const state    = searchParams.get('state')
  const errParam = searchParams.get('error')

  if (errParam) {
    console.error('[github/callback] OAuth error:', errParam)
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=github_denied`, request.nextUrl.origin))
  }

  // ── State verification ───────────────────────────────────
  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state_github')?.value
  cookieStore.delete('oauth_state_github')

  if (!state || state !== storedState) {
    console.error('[github/callback] State mismatch')
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

  // ── Exchange code for token ───────────────────────────────
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method:  'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri:  process.env.GITHUB_REDIRECT_URI,
    }),
  })

  if (!tokenRes.ok) {
    console.error('[github/callback] Token exchange failed:', tokenRes.status)
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=token_exchange`, request.nextUrl.origin))
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    scope:        string
    token_type:   string
    error?:       string
  }

  if (tokens.error || !tokens.access_token) {
    console.error('[github/callback] Token error:', tokens.error)
    return NextResponse.redirect(new URL(`${SETTINGS_URL}?error=token_exchange`, request.nextUrl.origin))
  }

  // ── Fetch GitHub user info ─────────────────────────────────
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  const ghUser = userRes.ok
    ? (await userRes.json() as { id: number; login: string; email: string | null; name: string | null })
    : null

  // ── Save integration ──────────────────────────────────────
  await saveIntegration(supabase, user.id, {
    provider:         'github',
    access_token:     tokens.access_token,
    refresh_token:    null,         // GitHub doesn't use refresh tokens
    token_expires_at: null,         // GitHub tokens don't expire
    scope:            tokens.scope,
    provider_user_id: ghUser ? String(ghUser.id) : null,
    provider_email:   ghUser?.email ?? null,
    metadata:         { login: ghUser?.login ?? null, name: ghUser?.name ?? null },
  })

  return NextResponse.redirect(new URL(`${SETTINGS_URL}?connected=github`, request.nextUrl.origin))
}
