import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Maneja el callback OAuth (GitHub, Google, etc.) y el magic link de email.
// Supabase redirige aquí con un `code` tras la autenticación externa.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` permite redirigir a una ruta específica tras el login
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si algo falla, volver a la landing con el modal abierto
  return NextResponse.redirect(`${origin}/?modal=login`)
}
