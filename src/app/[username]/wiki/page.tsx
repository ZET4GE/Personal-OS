import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen, Tag, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getPublicNotes } from '@/services/notes'

interface PageProps {
  params:       Promise<{ username: string }>
  searchParams: Promise<{ tag?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'Wiki no encontrada' }

  const displayName = profile.full_name ?? `@${username}`
  return {
    title:       `Wiki · ${displayName}`,
    description: `Base de conocimiento de ${displayName}`,
  }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

export default async function PublicWikiPage({ params, searchParams }: PageProps) {
  const { username } = await params
  const { tag }      = await searchParams

  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  const { data: notes } = await getPublicNotes(supabase, profile.id)
  const allNotes = notes ?? []

  const filtered = tag
    ? allNotes.filter((n) => n.tags.includes(tag))
    : allNotes

  const allTags = [...new Set(allNotes.flatMap((n) => n.tags))].sort()
  const displayName = profile.full_name ?? `@${username}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-xs text-muted">
        <Link href={`/${username}`} className="transition-colors hover:text-foreground">
          {displayName}
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Wiki</span>
        {tag && (
          <>
            <ChevronRight size={12} />
            <span className="text-foreground">#{tag}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <BookOpen size={24} className="text-accent-600" />
          <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
        </div>
        <p className="mt-2 text-muted">
          {tag
            ? <>Notas con #{tag} — {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}{' '}
                <Link href={`/${username}/wiki`} className="text-accent-600 hover:underline">Ver todas</Link>
              </>
            : `${filtered.length} página${filtered.length !== 1 ? 's' : ''} públicas`
          }
        </p>
      </header>

      {/* Tag cloud */}
      {allTags.length > 0 && !tag && (
        <div className="mb-8 flex flex-wrap gap-1.5">
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/${username}/wiki?tag=${encodeURIComponent(t)}`}
              className="flex items-center gap-1 rounded-full bg-surface-elevated px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              <Tag size={10} /> {t}
            </Link>
          ))}
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen size={28} className="text-muted" />
          <p className="text-muted">
            {tag ? `Sin notas con #${tag}` : 'Esta wiki no tiene páginas públicas aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <Link
              key={note.id}
              href={`/${username}/wiki/${note.slug}`}
              className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-border-bright hover:shadow-sm"
            >
              <h2 className="font-semibold text-text transition-colors group-hover:text-accent-600">
                {note.title}
              </h2>
              {note.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-sm text-muted">{note.excerpt}</p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatDate(note.updated_at)}
                </span>
                {note.word_count > 0 && (
                  <span>{note.word_count} palabras</span>
                )}
                {note.tags.length > 0 && (
                  <div className="flex gap-1">
                    {note.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
