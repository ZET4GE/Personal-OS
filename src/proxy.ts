import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// En Next.js 16 el archivo se llama proxy.ts y la función se llama proxy.
// Corre antes de cada render: refresca el token y protege rutas privadas.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          // Escribir cookies tanto en la request como en la response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
          // Propagar los headers que requiere Supabase (cache-control, etc.)
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          )
        },
      },
    },
  )

  // IMPORTANTE: llamar getUser() aquí refresca el token si expiró.
  // No usar getSession() — no verifica el token con el servidor.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Proteger rutas privadas: redirigir a /login si no hay sesión
  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si el usuario ya está autenticado, redirigir fuera de las páginas de auth
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
