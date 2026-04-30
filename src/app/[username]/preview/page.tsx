import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, GitBranch, PenLine, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getPublicProjectsByUsername } from '@/services/profiles'
import { getPublicLearningRoadmapsByUser } from '@/services/learning-roadmaps'
import { getPublicPosts } from '@/services/posts'
import { getEarliestWorkYear } from '@/services/cv'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicProjectsGrid } from '@/components/public/PublicProjectsGrid'
import { PublicRoadmapsGrid } from '@/components/public/PublicRoadmapsGrid'
import { TrackingPixel } from '@/components/analytics/TrackingPixel'

// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Perfil no encontrado' }
  const displayName = profile.full_name ?? `@${username}`
  return { title: `${displayName} — vista previa` }
}

// ─────────────────────────────────────────────────────────────

export default async function PreviewProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  // Only the owner can view this page (protect against abuse)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== profile.id) notFound()

  const [{ data: projects }, { data: roadmaps }, { data: posts }, earliestYear] = await Promise.all([
    getPublicProjectsByUsername(supabase, profile.id),
    getPublicLearningRoadmapsByUser(supabase, profile.id),
    getPublicPosts(supabase, profile.id),
    getEarliestWorkYear(supabase, profile.id),
  ])

  const yearsExp = earliestYear != null ? new Date().getFullYear() - earliestYear : null

  const stats = {
    projects:  (projects  ?? []).length,
    roadmaps:  (roadmaps  ?? []).length,
    posts:     (posts     ?? []).length,
    yearsExp,
  }

  return (
    <>
      {/* Hide the WINF nav so the view matches what a non-user sees */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: '.public-nav { display: none !important; }' }} />

      <main className="public-body mx-auto max-w-5xl px-4 py-12 sm:px-6 animate-public-fade-in">
        {/* Preview banner — only visible in this mode */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400">
          <span>Vista previa — así ven tu perfil quienes no tienen cuenta en WINF</span>
          <Link href={`/${username}`} className="font-medium underline underline-offset-2 hover:opacity-80">
            Salir de preview
          </Link>
        </div>

        <TrackingPixel pageType="profile" ownerId={profile.id} currentUserId={null} />

        <PublicHeader profile={profile} username={username} stats={stats} />

        <div className="public-divider my-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

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
    </>
  )
}
