import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Calendar, ChevronRight, ChevronLeft, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPostBySlug, getAdjacentPosts } from '@/services/posts'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { TagsList } from '@/components/blog/TagsList'
import { TrackingPixel } from '@/components/analytics/TrackingPixel'
import { ShareButton } from '@/components/blog/ShareButton'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata + Open Graph
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Post no encontrado' }

  const { data: post } = await getPostBySlug(supabase, profile.id, slug)
  if (!post) return { title: 'Post no encontrado' }

  const displayName = profile.full_name ?? `@${username}`
  const description = post.excerpt ?? post.content.slice(0, 160)

  return {
    title:       `${post.title} · ${displayName}`,
    description,
    openGraph: {
      title:       post.title,
      description,
      type:        'article',
      publishedTime: post.published_at ?? undefined,
      authors:     [displayName],
      tags:        post.tags,
      ...(post.cover_image ? { images: [{ url: post.cover_image }] } : {}),
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

export default async function PublicPostPage({ params }: PageProps) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: post } = await getPostBySlug(supabase, profile.id, slug)
  if (!post) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const displayName = profile.full_name ?? `@${username}`

  const { prev, next } = post.published_at
    ? await getAdjacentPosts(supabase, profile.id, post.published_at)
    : { prev: null, next: null }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <TrackingPixel pageType="post" pageId={post.id} ownerId={profile.id} currentUserId={user?.id ?? null} />

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-xs text-muted">
        <Link href={`/${username}`} className="transition-colors hover:text-foreground">
          {displayName}
        </Link>
        <ChevronRight size={12} />
        <Link href={`/${username}/blog`} className="transition-colors hover:text-foreground">
          Blog
        </Link>
        <ChevronRight size={12} />
        <span className="max-w-[200px] truncate text-foreground">{post.title}</span>
      </nav>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        {post.tags.length > 0 && (
          <TagsList tags={post.tags} username={username} className="mb-4" />
        )}

        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-3 text-lg text-muted leading-relaxed">{post.excerpt}</p>
        )}

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {formatDate(post.published_at ?? post.created_at)}
          </span>
          {post.reading_time && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {post.reading_time} min de lectura
            </span>
          )}
          <span className="flex items-center gap-1.5">
            Por{' '}
            <Link href={`/${username}`} className="font-medium text-foreground hover:text-accent-600 dark:hover:text-accent-400">
              {displayName}
            </Link>
          </span>
        </div>
      </header>

      {/* Divider */}
      <div className="mb-8 border-t border-border" />

      {/* Content */}
      <MarkdownRenderer content={post.content} className="text-[15px] leading-7" />

      {/* Share */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        <Link
          href={`/${username}/blog`}
          className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Volver al blog
        </Link>
        <ShareButton title={post.title} />
      </div>

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <nav className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/${username}/blog/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-bright"
            >
              <span className="flex items-center gap-1 text-xs text-muted">
                <ChevronLeft size={12} /> Anterior
              </span>
              <span className="text-sm font-medium leading-snug group-hover:text-accent-600 dark:group-hover:text-accent-400 line-clamp-2">
                {prev.title}
              </span>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/${username}/blog/${next.slug}`}
              className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-bright sm:text-right"
            >
              <span className="flex items-center gap-1 text-xs text-muted">
                Siguiente <ChevronRight size={12} />
              </span>
              <span className="text-sm font-medium leading-snug group-hover:text-accent-600 dark:group-hover:text-accent-400 line-clamp-2">
                {next.title}
              </span>
            </Link>
          ) : <div />}
        </nav>
      )}
    </main>
  )
}
