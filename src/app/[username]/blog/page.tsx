import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Calendar, PenLine, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPublicPosts } from '@/services/posts'
import { TagsList } from '@/components/blog/TagsList'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params:       Promise<{ username: string }>
  searchParams: Promise<{ tag?: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Blog no encontrado' }

  const displayName = profile.full_name ?? `@${username}`
  return {
    title:       `Blog · ${displayName}`,
    description: `Posts de ${displayName}`,
    openGraph: {
      title:       `Blog · ${displayName}`,
      description: `Posts de ${displayName}`,
      type:        'website',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function PublicBlogPage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { tag }      = await searchParams

  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: posts } = await getPublicPosts(supabase, profile.id, tag)
  const displayName     = profile.full_name ?? `@${username}`
  const allPosts        = posts ?? []

  // Collect all tags for filter cloud
  const allTags = [...new Set(allPosts.flatMap((p) => p.tags))].sort()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-xs text-muted">
        <Link href={`/${username}`} className="transition-colors hover:text-foreground">
          {displayName}
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Blog</span>
        {tag && (
          <>
            <ChevronRight size={12} />
            <span className="text-foreground">#{tag}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        {tag ? (
          <p className="mt-2 text-muted">
            Posts con #{tag} — {allPosts.length} resultado{allPosts.length !== 1 ? 's' : ''}{' '}
            <Link href={`/${username}/blog`} className="text-accent-600 hover:underline dark:text-accent-400">
              Ver todos
            </Link>
          </p>
        ) : (
          <p className="mt-1 text-muted">{allPosts.length} post{allPosts.length !== 1 ? 's' : ''}</p>
        )}
      </header>

      {/* Tag cloud */}
      {allTags.length > 0 && !tag && (
        <div className="mb-8">
          <TagsList tags={allTags} username={username} />
        </div>
      )}

      {/* Posts */}
      {allPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PenLine size={28} className="text-muted" />
          <p className="text-muted">
            {tag ? `Sin posts con #${tag}` : 'Aún no hay posts publicados'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {allPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-border-bright hover:shadow-sm"
            >
              {/* Cover image */}
              {post.cover_image && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <TagsList tags={post.tags} username={username} className="mb-3" />
              )}

              {/* Title */}
              <Link href={`/${username}/blog/${post.slug}`}>
                <h2 className="text-xl font-bold leading-snug transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-400">
                  {post.title}
                </h2>
              </Link>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="mt-2 leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>
              )}

              {/* Metadata footer */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(post.published_at ?? post.created_at)}
                  </span>
                  {post.reading_time && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.reading_time} min de lectura
                    </span>
                  )}
                </div>
                <Link
                  href={`/${username}/blog/${post.slug}`}
                  className="text-xs font-medium text-accent-600 transition-colors hover:text-accent-700 dark:text-accent-400"
                >
                  Leer más →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
