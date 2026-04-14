import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ')

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SUPABASE_URL!))
  }

  const state      = randomUUID()
  const cookieStore = await cookies()

  cookieStore.set('oauth_state_google', state, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'lax',
    maxAge:    600,   // 10 min
    path:      '/',
  })

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id',     process.env.GOOGLE_CLIENT_ID!)
  url.searchParams.set('redirect_uri',  process.env.GOOGLE_REDIRECT_URI!)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope',         SCOPES)
  url.searchParams.set('access_type',   'offline')
  url.searchParams.set('prompt',        'consent')   // force refresh_token
  url.searchParams.set('state',         state)

  return NextResponse.redirect(url.toString())
}
