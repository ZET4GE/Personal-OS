import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type EnabledModule =
  | 'projects'
  | 'habits'
  | 'routines'
  | 'time'
  | 'jobs'
  | 'clients'
  | 'freelance'
  | 'finance'
  | 'notes'
  | 'cv'
  | 'blog'
  | 'analytics'

type Persona = 'student' | 'freelancer' | 'employee' | 'builder' | 'personal'

const MODULES_BY_PERSONA: Record<Persona, EnabledModule[]> = {
  student: ['projects', 'habits', 'routines', 'time', 'notes', 'cv'],
  freelancer: ['projects', 'habits', 'routines', 'time', 'clients', 'freelance', 'finance', 'notes', 'cv', 'analytics'],
  employee: ['projects', 'habits', 'routines', 'time', 'jobs', 'notes', 'cv'],
  builder: ['projects', 'habits', 'routines', 'time', 'notes', 'blog', 'analytics'],
  personal: ['habits', 'routines', 'time', 'finance', 'notes'],
}

const ALL_MODULES = Array.from(new Set(Object.values(MODULES_BY_PERSONA).flat()))

const MODULE_ROUTES: Array<{ module: EnabledModule; prefixes: string[] }> = [
  { module: 'projects', prefixes: ['/projects'] },
  { module: 'habits', prefixes: ['/habits'] },
  { module: 'routines', prefixes: ['/routines'] },
  { module: 'time', prefixes: ['/time'] },
  { module: 'jobs', prefixes: ['/jobs'] },
  { module: 'clients', prefixes: ['/clients'] },
  { module: 'freelance', prefixes: ['/freelance'] },
  { module: 'finance', prefixes: ['/finance'] },
  { module: 'notes', prefixes: ['/notes'] },
  { module: 'cv', prefixes: ['/cv'] },
  { module: 'blog', prefixes: ['/blog'] },
  { module: 'analytics', prefixes: ['/analytics'] },
]

function getRequiredModule(pathname: string): EnabledModule | null {
  return MODULE_ROUTES.find(({ prefixes }) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  )?.module ?? null
}

function resolveEnabledModules(onboarding: {
  persona: Persona | null
  enabled_modules: EnabledModule[] | null
} | null): Set<EnabledModule> {
  if (!onboarding) return new Set(ALL_MODULES)
  if (onboarding.enabled_modules?.length) {
    return new Set([...onboarding.enabled_modules, 'time'])
  }

  return new Set(onboarding.persona ? MODULES_BY_PERSONA[onboarding.persona] : ALL_MODULES)
}

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

  // Proteger rutas /admin
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (user.app_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Si el usuario ya está autenticado, redirigir fuera de las páginas de auth
  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const requiredModule = user ? getRequiredModule(pathname) : null
  if (user && requiredModule) {
    const { data: onboarding } = await supabase
      .from('user_onboarding')
      .select('persona, enabled_modules')
      .eq('user_id', user.id)
      .maybeSingle()

    const enabledModules = resolveEnabledModules(onboarding as {
      persona: Persona | null
      enabled_modules: EnabledModule[] | null
    } | null)

    if (!enabledModules.has(requiredModule)) {
      const url = new URL('/settings/preferences', request.url)
      url.searchParams.set('module', requiredModule)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
