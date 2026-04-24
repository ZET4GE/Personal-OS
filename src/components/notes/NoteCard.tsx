'use client'

import { useTransition } from 'react'
import { Pin, Archive, Globe, Lock, Trash2, PinOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Note } from '@/types/notes'
import { togglePinAction, toggleArchiveAction, deleteNoteAction } from '@/app/(dashboard)/notes/actions'

interface Props {
  note:     Note
  active:   boolean
  onClick:  () => void
}

export function NoteCard({ note, active, onClick }: Props) {
  const t = useTranslations('notes')
  const [pending, start] = useTransition()

  const relativeTime = (() => {
    const diff = Date.now() - new Date(note.updated_at).getTime()
    const min  = Math.floor(diff / 60_000)
    const hr   = Math.floor(diff / 3_600_000)
    const day  = Math.floor(diff / 86_400_000)
    if (min < 1)  return 'justo ahora'
    if (min < 60) return `hace ${min}m`
    if (hr < 24)  return `hace ${hr}h`
    return `hace ${day}d`
  })()

  function handlePin(e: React.MouseEvent) {
    e.stopPropagation()
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('value', String(!note.is_pinned))
    start(async () => { await togglePinAction(fd) })
  }

  function handleArchive(e: React.MouseEvent) {
    e.stopPropagation()
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('value', String(!note.is_archived))
    start(async () => { await toggleArchiveAction(fd) })
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(t('deleteConfirm'))) return
    const fd = new FormData()
    fd.set('id', note.id)
    start(async () => { await deleteNoteAction(fd) })
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-all ${
        active
          ? 'border-accent-600/60 bg-accent-600/5 shadow-sm'
          : 'border-border bg-surface hover:border-border-hover hover:shadow-[var(--shadow-card-hover)]'
      } ${pending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {/* Title row */}
      <div className="flex items-start gap-2">
        <span className="flex-1 truncate text-sm font-semibold text-text">
          {note.title || t('untitled')}
        </span>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handlePin}
            title={note.is_pinned ? t('unpin') : t('pin')}
            className="rounded p-0.5 text-muted hover:text-accent-600"
          >
            {note.is_pinned ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button
            onClick={handleArchive}
            title={note.is_archived ? t('unarchive') : t('archive')}
            className="rounded p-0.5 text-muted hover:text-amber-500"
          >
            <Archive size={12} />
          </button>
          <button
            onClick={handleDelete}
            title={t('delete')}
            className="rounded p-0.5 text-muted hover:text-red-500"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Excerpt */}
      {note.excerpt && (
        <p className="line-clamp-2 text-xs text-muted">{note.excerpt}</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 text-[10px] text-muted/70">
        <span>{relativeTime}</span>
        {note.word_count > 0 && (
          <span>· {note.word_count} {t('words')}</span>
        )}
        {note.is_pinned && (
          <span className="flex items-center gap-0.5 text-accent-600">
            <Pin size={9} /> {t('pinned')}
          </span>
        )}
        {note.is_public
          ? <Globe size={10} className="text-emerald-500" />
          : <Lock size={10} className="text-muted/40" />
        }
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-elevated px-1.5 py-0.5 text-[10px] text-muted"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="rounded-full bg-surface-elevated px-1.5 py-0.5 text-[10px] text-muted">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
