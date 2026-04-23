import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublicThemeClasses, getPublicThemeStyle } from '@/lib/public-theme'
import { getProfileByUsername } from '@/services/profiles'
import { WINFLogo } from '@/components/brand/WINFLogo'
import '../globals.css'

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await getProfileByUsername(supabase, username)
  const themeClasses = getPublicThemeClasses(profile)
  const themeStyle = getPublicThemeStyle(profile)

  return (
    <div className={`${themeClasses} min-h-screen`} style={themeStyle}>
      <header
        className="public-nav sticky top-0 z-10 flex h-12 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Link href="/" className="public-heading text-sm font-semibold tracking-tight text-text">
          <WINFLogo
            markClassName="h-6 w-6 text-text"
            wordmarkClassName="text-sm font-semibold tracking-tight text-text"
          />
        </Link>

        {user ? (
          <Link
            href="/dashboard"
            className="public-button rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
          >
            Ir al dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="public-button rounded-lg border px-3 py-1 text-xs font-medium transition-colors"
          >
            Iniciar sesion
          </Link>
        )}
      </header>

      {children}
    </div>
  )
}
