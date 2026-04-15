import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPublicPostsFeed } from '@/services/posts'
import { TagsList } from '@/components/blog/TagsList'

export const metadata: Metadata = {
  title:       'Blog publico',
  description: 'Posts publicados por la comunidad',
}

interface PageProps {
  searchParams: Promise<{ tag?: string }>
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export default async function ExploreBlogPage({ searchParams }: PageProps) {
  const { tag } = await searchParams

  const supabase = await createClient()
  const { data: posts } = await getPublicPostsFeed(supabase, tag)
  const allPosts = posts ?? []
  const allTags  = [...new Set(allPosts.flatMap((post) => post.tags))].sort()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav className="mb-8 flex items-center gap-1 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-foreground">
          Inicio
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Blog publico</span>
        {tag && (
          <>
            <ChevronRight size={12} />
            <span className="text-foreground">#{tag}</span>
          </>
        )}
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Blog publico</h1>
        <p className="mt-2 text-muted">
          {tag
            ? `Posts publicados con #${tag}`
            : 'Descubri posts publicados por usuarios con perfil publico.'}
        </p>
      </header>

      {allTags.length > 0 && !tag && (
        <div className="mb-8">
          <TagsList tags={allTags} />
        </div>
      )}

      {allPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PenLine size={28} className="text-muted" />
          <p className="text-muted">
            {tag ? `Sin posts con #${tag}` : 'Todavia no hay posts publicos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {allPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-border-bright hover:shadow-sm"
            >
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

              {post.tags.length > 0 && (
                <TagsList tags={post.tags} className="mb-3" />
              )}

              <div className="mb-3 text-xs text-muted">
                <Link
                  href={`/${post.author.username}`}
                  className="font-medium text-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-400"
                >
                  {post.author.full_name ?? `@${post.author.username}`}
                </Link>
              </div>

              <Link href={`/${post.author.username}/blog/${post.slug}`}>
                <h2 className="text-xl font-bold leading-snug transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-400">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="mt-2 leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>
              )}

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
                  href={`/${post.author.username}/blog/${post.slug}`}
                  className="text-xs font-medium text-accent-600 transition-colors hover:text-accent-700 dark:text-accent-400"
                >
                  Leer mas
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
