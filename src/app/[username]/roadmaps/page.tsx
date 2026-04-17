import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPublicLearningRoadmapsByUser } from '@/services/learning-roadmaps'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicRoadmapsGrid } from '@/components/public/PublicRoadmapsGrid'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)

  if (!profile) return { title: 'Roadmaps no encontrados' }

  const displayName = profile.full_name ?? `@${username}`

  return {
    title: `Roadmaps de ${displayName}`,
    description: `Caminos publicos de ${displayName} en WINF`,
  }
}

export default async function PublicRoadmapsPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: roadmaps } = await getPublicLearningRoadmapsByUser(supabase, profile.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PublicHeader profile={profile} />

      <div className="my-10 border-t border-border" />

      <nav className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Roadmaps
        </h2>
        <Link
          href={`/${username}`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <FolderOpen size={13} />
          Proyectos
        </Link>
        <Link
          href={`/${username}/cv`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <FileText size={13} />
          CV
        </Link>
      </nav>

      <PublicRoadmapsGrid roadmaps={roadmaps ?? []} username={username} />
    </main>
  )
}
