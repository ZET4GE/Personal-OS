'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { X, Loader2, StickyNote } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createNoteAction } from '@/app/(dashboard)/notes/actions'

export function QuickCapture() {
  const t = useTranslations('notes')
  const router = useRouter()
  const [open,    setOpen]    = useState(false)
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [pending, start]      = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Ctrl+Shift+N
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setTitle('')
      setContent('')
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) { setOpen(false); return }

    const fd = new FormData()
    if (title.trim()) fd.set('title', title.trim())
    if (content.trim()) fd.set('content', content.trim())

    start(async () => {
      const result = await createNoteAction(fd)
      setOpen(false)
      if ('note' in result && result.note) {
        router.push(`/notes?id=${result.note.id}`)
      }
    })
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label={t('quickCapture')}
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <StickyNote size={15} className="text-accent-600" />
            {t('quickCapture')}
          </div>
          <div className="flex items-center gap-2">
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
              Ctrl+Shift+N
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted hover:bg-surface-hover hover:text-text"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('untitled')}
            className="w-full bg-transparent text-base font-semibold text-text placeholder:text-muted/40 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('startWriting')}
            rows={5}
            className="w-full resize-none bg-transparent font-mono text-sm text-text placeholder:text-muted/30 outline-none"
          />

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-hover"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={pending || (!title.trim() && !content.trim())}
              className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? <Loader2 size={12} className="animate-spin" /> : null}
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
