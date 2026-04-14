import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Clock, Globe, Tag, BookOpen, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPublicNoteBySlug, getBacklinks } from '@/services/notes'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Página no encontrada' }

  const { data: note } = await getPublicNoteBySlug(supabase, profile.id, slug)
  if (!note) return { title: 'Página no encontrada' }

  return {
    title:       `${note.title} · Wiki de ${profile.full_name ?? username}`,
    description: note.excerpt ?? undefined,
    openGraph: {
      title:       note.title,
      description: note.excerpt ?? undefined,
      type:        'article',
    },
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

// Replace [[title]] with links to wiki pages
function processWikiLinks(content: string, username: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `[${title}](/${username}/wiki/${slug})`
  })
}

export default async function WikiNotePage({ params }: PageProps) {
  const { username, slug } = await params

  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: note } = await getPublicNoteBySlug(supabase, profile.id, slug)
  if (!note) notFound()

  const { data: backlinks } = await getBacklinks(supabase, note.id)
  const displayName = profile.full_name ?? `@${username}`

  const processedContent = processWikiLinks(note.content, username)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-xs text-muted">
        <Link href={`/${username}`} className="transition-colors hover:text-foreground">
          {displayName}
        </Link>
        <ChevronRight size={12} />
        <Link href={`/${username}/wiki`} className="transition-colors hover:text-foreground">
          Wiki
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">{note.title}</span>
      </nav>

      {/* Article */}
      <article>
        {/* Header */}
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-text">{note.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock size={11} /> Actualizado el {formatDate(note.updated_at)}
            </span>
            {note.word_count > 0 && (
              <span>{note.word_count} palabras</span>
            )}
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Globe size={11} /> Público
            </span>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/${username}/wiki?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted transition-colors hover:bg-surface-3 hover:text-text"
                >
                  <Tag size={9} /> {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose-custom">
          <MarkdownRenderer content={processedContent} />
        </div>
      </article>

      {/* Backlinks */}
      {backlinks && backlinks.length > 0 && (
        <aside className="mt-12 rounded-xl border border-border bg-surface-2 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <Link2 size={14} />
            Páginas que enlazan esta ({backlinks.length})
          </h3>
          <ul className="space-y-1.5">
            {backlinks.map((bl) => (
              <li key={bl.id}>
                <Link
                  href={`/${username}/wiki/${bl.slug}`}
                  className="text-sm text-accent-600 hover:underline dark:text-accent-400"
                >
                  {bl.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Footer nav */}
      <div className="mt-8 border-t border-border pt-6">
        <Link
          href={`/${username}/wiki`}
          className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text"
        >
          <BookOpen size={14} />
          Ver todas las páginas de la Wiki
        </Link>
      </div>
    </main>
  )
}
