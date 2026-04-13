import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getPublicProjectsByUsername } from '@/services/profiles'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicProjectsGrid } from '@/components/public/PublicProjectsGrid'

// ─────────────────────────────────────────────────────────────
// Types — params es Promise en Next.js 16
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata dinámica
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)

  if (!profile) {
    return { title: 'Perfil no encontrado' }
  }

  return {
    title: profile.full_name ?? `@${username}`,
    description: profile.bio ?? `Perfil de @${username} en Personal OS`,
    openGraph: {
      title: profile.full_name ?? `@${username}`,
      description: profile.bio ?? undefined,
      type: 'profile',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile — si no existe o no es público, 404
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  // Fetch proyectos públicos en paralelo (ya tenemos el profile.id)
  const { data: projects } = await getPublicProjectsByUsername(supabase, profile.id)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header: avatar, nombre, bio, links */}
      <PublicHeader profile={profile} />

      {/* Divider */}
      <div className="my-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Nav tabs: Proyectos · CV */}
      <nav className="mb-6 flex items-center gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Proyectos
        </h2>
        <Link
          href={`/${username}/cv`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <FileText size={13} />
          CV
        </Link>
      </nav>

      <PublicProjectsGrid projects={projects ?? []} username={username} />
    </main>
  )
}
