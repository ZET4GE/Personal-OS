import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Úsalo en Server Components, Server Actions y Route Handlers.
// IMPORTANTE: crea un cliente nuevo por request, nunca compartas entre requests.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // En Server Components y Route Handlers sin respuesta mutable
          // este bloque puede no ejecutarse. El proxy.ts es quien persiste
          // el refresh del token en la respuesta saliente.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Silenciado en renders donde no se pueden escribir cookies
          }
        },
      },
    },
  )
}
