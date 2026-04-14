import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

const SCOPES = 'read:user,repo'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SUPABASE_URL!))
  }

  const state       = randomUUID()
  const cookieStore = await cookies()

  cookieStore.set('oauth_state_github', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   600,
    path:     '/',
  })

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id',    process.env.GITHUB_CLIENT_ID!)
  url.searchParams.set('redirect_uri', process.env.GITHUB_REDIRECT_URI!)
  url.searchParams.set('scope',        SCOPES)
  url.searchParams.set('state',        state)

  return NextResponse.redirect(url.toString())
}
