import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WINFLogo } from '@/components/brand/WINFLogo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')
  if (user.app_metadata?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <WINFLogo
              markClassName="h-6 w-6 text-text"
              wordmarkClassName="text-sm font-semibold tracking-tight text-text"
            />
            <span className="text-muted">/</span>
            <span className="text-sm font-medium text-text">Admin</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            ← Volver al dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
