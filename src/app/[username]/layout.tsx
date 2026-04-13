import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import '../globals.css'

// El layout público es independiente del dashboard shell.
// Muestra una topbar mínima con enlace de regreso al app si el usuario está loggeado.

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      {/* Topbar mínima */}
      <header
        className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-surface/80 px-4 backdrop-blur-sm sm:px-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-accent-600"
        >
          Personal OS
        </Link>

        {user ? (
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Ir al dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Iniciar sesión
          </Link>
        )}
      </header>

      {children}
    </div>
  )
}
