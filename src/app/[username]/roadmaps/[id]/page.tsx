import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPublicLearningRoadmapDetail } from '@/services/learning-roadmaps'
import { PublicRoadmapDetail } from '@/components/public/PublicRoadmapDetail'

interface PageProps {
  params: Promise<{ username: string; id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, id } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Roadmap no encontrado' }

  const { data: detail } = await getPublicLearningRoadmapDetail(supabase, id, profile.id)
  if (!detail) return { title: 'Roadmap no encontrado' }

  const displayName = profile.full_name ?? `@${username}`

  return {
    title: `${detail.roadmap.title} - ${displayName}`,
    description: detail.roadmap.description ?? `Roadmap publico de ${displayName} en WINF`,
  }
}

export default async function PublicRoadmapPage({ params }: PageProps) {
  const { username, id } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: detail } = await getPublicLearningRoadmapDetail(supabase, id, profile.id)
  if (!detail) notFound()

  const displayName = profile.full_name ?? `@${username}`

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PublicRoadmapDetail detail={detail} username={username} displayName={displayName} />
    </main>
  )
}
