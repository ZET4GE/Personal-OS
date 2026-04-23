import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, GitBranch, PenLine, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getPublicProjectsByUsername } from '@/services/profiles'
import { getPublicLearningRoadmapsByUser } from '@/services/learning-roadmaps'
import { getPublicPosts } from '@/services/posts'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicProjectsGrid } from '@/components/public/PublicProjectsGrid'
import { PublicRoadmapsGrid } from '@/components/public/PublicRoadmapsGrid'
import { TrackingPixel } from '@/components/analytics/TrackingPixel'

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
    description: profile.bio ?? `Perfil de @${username} en WINF`,
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

  // Visitor actual (para no trackear al owner viendo su propio perfil)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch proyectos públicos en paralelo (ya tenemos el profile.id)
  const [{ data: projects }, { data: roadmaps }, { data: posts }] = await Promise.all([
    getPublicProjectsByUsername(supabase, profile.id),
    getPublicLearningRoadmapsByUser(supabase, profile.id),
    getPublicPosts(supabase, profile.id),
  ])

  return (
    <main className="public-body mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <TrackingPixel pageType="profile" ownerId={profile.id} currentUserId={user?.id ?? null} />
      {/* Header: avatar, nombre, bio, links */}
      <PublicHeader profile={profile} />

      {/* Divider */}
      <div className="public-divider my-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Nav tabs: Proyectos · CV */}
      <nav className="mb-6 flex items-center gap-4">
        <h2 className="public-heading text-xs font-semibold uppercase tracking-widest text-muted">
          Proyectos
        </h2>
        <Link
          href={`/${username}/roadmaps`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <GitBranch size={13} />
          Roadmaps
        </Link>
        <Link
          href={`/${username}/cv`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <FileText size={13} />
          CV
        </Link>
        <Link
          href={`/${username}/blog`}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <PenLine size={13} />
          Blog
        </Link>
      </nav>

      {(roadmaps ?? []).length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Roadmaps publicados</h2>
            <Link href={`/${username}/roadmaps`} className="text-sm font-medium text-muted hover:text-foreground">
              Ver todos
            </Link>
          </div>
          <PublicRoadmapsGrid roadmaps={(roadmaps ?? []).slice(0, 3)} username={username} />
        </section>
      )}

      {(posts ?? []).length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Últimos posts</h2>
            <Link href={`/${username}/blog`} className="text-sm font-medium text-muted hover:text-foreground">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {(posts ?? []).slice(0, 2).map((post) => (
              <Link
                key={post.id}
                href={`/${username}/blog/${post.slug}`}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-border-bright hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{post.title}</p>
                  {post.excerpt && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{post.excerpt}</p>
                  )}
                </div>
                {post.published_at && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                    <Calendar size={11} />
                    {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(post.published_at))}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">Proyectos publicados</h2>
        </div>
        <PublicProjectsGrid projects={projects ?? []} username={username} />
      </section>
    </main>
  )
}
