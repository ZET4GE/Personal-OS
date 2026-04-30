import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, FolderGit2, GitBranch, PenLine, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getPublicProjectsByUsername } from '@/services/profiles'
import { getPublicLearningRoadmapsByUser } from '@/services/learning-roadmaps'
import { getPublicPosts } from '@/services/posts'
import { getEarliestWorkYear } from '@/services/cv'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicProjectsGrid } from '@/components/public/PublicProjectsGrid'
import { PublicRoadmapsGrid } from '@/components/public/PublicRoadmapsGrid'
import { PageNavigation } from '@/components/public/PageNavigation'
import { ScrollToTopButton } from '@/components/public/ScrollToTopButton'
import { TrackingPixel } from '@/components/analytics/TrackingPixel'
import type { NavSection } from '@/components/public/PageNavigation'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)

  if (!profile) {
    return { title: 'Perfil no encontrado' }
  }

  const displayName = profile.full_name ?? `@${username}`
  return {
    title: displayName,
    description: profile.bio ?? `Perfil de @${username} en WINF`,
    openGraph: {
      title: displayName,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
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

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()

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

  const isOwner = user?.id === profile.id

  // Build in-page section nav — only sections with content
  const profileSections: NavSection[] = [
    (roadmaps ?? []).length > 0 ? { id: 'roadmaps',  label: 'Roadmaps',  icon: 'GitBranch'  } : null,
    (posts    ?? []).length > 0 ? { id: 'blog',      label: 'Blog',      icon: 'PenLine'    } : null,
    (projects ?? []).length > 0 ? { id: 'proyectos', label: 'Proyectos', icon: 'FolderGit2' } : null,
  ].filter(Boolean) as NavSection[]

  const showNav = profileSections.length >= 2

  return (
    <main className="public-body mx-auto max-w-5xl px-4 py-12 sm:px-6 animate-public-fade-in">
      <TrackingPixel pageType="profile" ownerId={profile.id} currentUserId={user?.id ?? null} />

      <PublicHeader profile={profile} username={username} stats={stats} isOwner={isOwner} />

      <div className="public-divider my-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Section tabs — link to other pages */}
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

      {/* Content — conditionally two-column on desktop if enough sections */}
      <div className={showNav ? 'lg:grid lg:grid-cols-[180px_1fr] lg:gap-10 lg:items-start' : ''}>
        {showNav && (
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PageNavigation sections={profileSections} ariaLabel="Navegación del perfil" />
          </div>
        )}

        <div className="space-y-10">
          {(roadmaps ?? []).length > 0 && (
            <section id="roadmaps" className="scroll-mt-24">
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
            <section id="blog" className="scroll-mt-24">
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

          {(projects ?? []).length > 0 && (
            <section id="proyectos" className="scroll-mt-24">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground">Proyectos publicados</h2>
              </div>
              <PublicProjectsGrid projects={projects ?? []} username={username} />
            </section>
          )}

          {(projects ?? []).length === 0 && (roadmaps ?? []).length === 0 && (posts ?? []).length === 0 && (
            <p className="text-center text-sm text-muted py-12">
              Este perfil aún no tiene contenido publicado.
            </p>
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </main>
  )
}
