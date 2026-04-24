import Link from 'next/link'
import { StickyNote, Clock, Pin, Globe, ChevronRight } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentNotes } from '@/services/notes'

interface Props {
  userId: string
}

export async function RecentNotes({ userId }: Props) {
  const supabase = await createClient()
  const [t, locale, result] = await Promise.all([
    getTranslations('notes'),
    getLocale(),
    getRecentNotes(supabase, userId, 5),
  ])

  const notes = result.data ?? []

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const min  = Math.floor(diff / 60_000)
    const hr   = Math.floor(diff / 3_600_000)
    const day  = Math.floor(diff / 86_400_000)
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      if (min < 1)  return rtf.format(0, 'minute')
      if (min < 60) return rtf.format(-min, 'minute')
      if (hr < 24)  return rtf.format(-hr, 'hour')
      return rtf.format(-day, 'day')
    } catch {
      if (min < 60) return `hace ${min}m`
      if (hr < 24)  return `hace ${hr}h`
      return `hace ${day}d`
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
          <StickyNote size={15} className="text-accent-600" />
          {t('recentNotes')}
        </h2>
        <Link
          href="/notes"
          className="flex items-center gap-0.5 text-xs text-muted transition-colors hover:text-accent-600"
        >
          {t('viewAll')} <ChevronRight size={12} />
        </Link>
      </div>

      {/* Notes */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <StickyNote size={24} className="text-muted/40" />
          <p className="text-xs text-muted">{t('noNotes')}</p>
          <Link href="/notes" className="text-xs text-accent-600 hover:underline">
            {t('createFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes?id=${note.id}`}
              className="group flex items-start gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:border-border hover:bg-surface-elevated"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-text group-hover:text-accent-600">
                  {note.title || t('untitled')}
                </p>
                {note.excerpt && (
                  <p className="mt-0.5 truncate text-xs text-muted">{note.excerpt}</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted/70">
                  <span className="flex items-center gap-0.5">
                    <Clock size={9} /> {formatRelative(note.updated_at)}
                  </span>
                  {note.is_pinned && <Pin size={9} className="text-accent-600" />}
                  {note.is_public && <Globe size={9} className="text-emerald-500" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
