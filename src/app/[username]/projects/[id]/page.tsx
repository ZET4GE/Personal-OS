import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getPublicProjectById } from '@/services/profiles'
import { ProjectDetail } from '@/components/public/ProjectDetail'

// ─────────────────────────────────────────────────────────────
// Types — params es Promise en Next.js 16
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string; id: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata dinámica
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, id } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Perfil no encontrado' }

  const { data: project } = await getPublicProjectById(supabase, id, profile.id)
  if (!project) return { title: 'Proyecto no encontrado' }

  const displayName = profile.full_name ?? `@${username}`

  return {
    title: `${project.title} · ${displayName}`,
    description: project.description ?? `Proyecto de ${displayName} en Personal OS`,
    openGraph: {
      title: `${project.title} · ${displayName}`,
      description: project.description ?? undefined,
      type: 'website',
      ...(project.image_url ? { images: [{ url: project.image_url }] } : {}),
    },
  }
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function PublicProjectPage({ params }: PageProps) {
  const { username, id } = await params
  const supabase = await createClient()

  // Fetch perfil — 404 si no existe o no es público
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  // Fetch proyecto — 404 si no existe, es privado o no pertenece al usuario
  const { data: project } = await getPublicProjectById(supabase, id, profile.id)
  if (!project) notFound()

  const displayName = profile.full_name ?? `@${username}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ProjectDetail project={project} username={username} displayName={displayName} />
    </main>
  )
}
