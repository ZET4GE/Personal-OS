'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import {
  Eye, Code2, Globe, Lock, Pin, PinOff, Archive, Save,
  Tag, CheckCheck, Loader2, Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Note } from '@/types/notes'
import { autoSaveNoteAction, togglePublicAction, togglePinAction, toggleArchiveAction } from '@/app/(dashboard)/notes/actions'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { TagSelector } from '@/components/tags/TagSelector'

// ─────────────────────────────────────────────────────────────
// Wiki-link renderer: replace [[title]] with spans in preview
// ─────────────────────────────────────────────────────────────

function processWikiLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, title: string) => {
    return `[${title}](#wiki-${encodeURIComponent(title)})`
  })
}

// ─────────────────────────────────────────────────────────────
// Toolbar button helper
// ─────────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, title, children, active = false,
}: {
  onClick: () => void; title: string; children: React.ReactNode; active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center rounded p-1.5 text-xs transition-colors ${
        active
          ? 'bg-accent-600/10 text-accent-600'
          : 'text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Main editor
// ─────────────────────────────────────────────────────────────

interface Props {
  note: Note
}

export function NoteEditor({ note }: Props) {
  const t = useTranslations('notes')
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [preview, setPreview] = useState(false)
  const [saved,   setSaved]   = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [tagInput, setTagInput] = useState(note.tags.join(', '))
  const [showTags, setShowTags] = useState(note.tags.length > 0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pending, start] = useTransition()

  // Reset when note changes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setTagInput(note.tags.join(', '))
    setShowTags(note.tags.length > 0)
    setSaved(true)
  }, [note.id])

  const triggerSave = useCallback((t: string, c: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaved(false)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await autoSaveNoteAction(note.id, t, c)
      setSaving(false)
      setSaved(true)
    }, 1000)
  }, [note.id])

  function handleTitleChange(v: string) {
    setTitle(v)
    triggerSave(v, content)
  }

  function handleContentChange(v: string) {
    setContent(v)
    triggerSave(title, v)
  }

  // Keyboard shortcuts in textarea
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el  = e.currentTarget
      const s   = el.selectionStart
      const end = el.selectionEnd
      const next = content.substring(0, s) + '  ' + content.substring(end)
      setContent(next)
      triggerSave(title, next)
      requestAnimationFrame(() => {
        el.selectionStart = s + 2
        el.selectionEnd   = s + 2
      })
    }
  }

  // Toolbar insertions
  function insert(before: string, after = '') {
    const ta = document.getElementById('note-textarea') as HTMLTextAreaElement | null
    if (!ta) return
    const s    = ta.selectionStart
    const e    = ta.selectionEnd
    const sel  = content.substring(s, e)
    const next = content.substring(0, s) + before + sel + after + content.substring(e)
    setContent(next)
    triggerSave(title, next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = s + before.length
      ta.selectionEnd   = s + before.length + sel.length
    })
  }

  function handleTogglePublic() {
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('value', String(!note.is_public))
    start(async () => { await togglePublicAction(fd) })
  }

  function handleTogglePin() {
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('value', String(!note.is_pinned))
    start(async () => { await togglePinAction(fd) })
  }

  function handleToggleArchive() {
    const fd = new FormData()
    fd.set('id', note.id)
    fd.set('value', String(!note.is_archived))
    start(async () => { await toggleArchiveAction(fd) })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Title */}
      <div className="border-b border-border px-5 py-4">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={t('untitled')}
          className="w-full bg-transparent text-xl font-bold text-text placeholder:text-muted/40 outline-none"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-3 py-1.5">
        {/* Format */}
        <ToolbarBtn onClick={() => insert('**', '**')} title="Bold">
          <span className="font-bold text-xs">B</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('_', '_')} title="Italic">
          <span className="italic text-xs">I</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('`', '`')} title="Inline code">
          <Code2 size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('## ')} title="Heading">
          <span className="text-[10px] font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('- ')} title="List">
          <span className="text-xs">≡</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('- [ ] ')} title="Task">
          <CheckCheck size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('> ')} title="Quote">
          <span className="text-xs font-bold">❝</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insert('\n```\n', '\n```')} title="Code block">
          <Code2 size={13} />
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-border" />

        {/* Wiki-link */}
        <ToolbarBtn onClick={() => insert('[[', ']]')} title={t('wikiLink')}>
          <span className="text-[10px]">[[]]</span>
        </ToolbarBtn>

        {/* Tags toggle */}
        <ToolbarBtn onClick={() => setShowTags((v) => !v)} title={t('tags')} active={showTags}>
          <Tag size={13} />
        </ToolbarBtn>

        <div className="mx-1.5 h-4 w-px bg-border" />

        {/* Preview toggle */}
        <ToolbarBtn onClick={() => setPreview((v) => !v)} title={t('preview')} active={preview}>
          <Eye size={13} />
        </ToolbarBtn>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Note actions */}
        <ToolbarBtn
          onClick={handleTogglePin}
          title={note.is_pinned ? t('unpin') : t('pin')}
          active={note.is_pinned}
        >
          {note.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
        </ToolbarBtn>

        <ToolbarBtn
          onClick={handleTogglePublic}
          title={note.is_public ? t('makePrivate') : t('makePublic')}
          active={note.is_public}
        >
          {note.is_public ? <Globe size={13} /> : <Lock size={13} />}
        </ToolbarBtn>

        <ToolbarBtn
          onClick={handleToggleArchive}
          title={note.is_archived ? t('unarchive') : t('archive')}
          active={note.is_archived}
        >
          <Archive size={13} />
        </ToolbarBtn>

        {/* Save indicator */}
        <div className="ml-1 flex items-center gap-1 text-[10px] text-muted">
          {saving ? (
            <><Loader2 size={11} className="animate-spin" /> {t('saving')}</>
          ) : saved ? (
            <><Save size={11} /> {t('saved')}</>
          ) : null}
        </div>
      </div>

      {/* Tags input */}
      {showTags && (
        <div className="border-b border-border px-4 py-2 space-y-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder={t('tagsPlaceholder')}
            className="w-full bg-transparent text-xs text-muted placeholder:text-muted/40 outline-none"
          />
          <TagSelector entityId={note.id} entityType="note" align="left" />
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto">
        {preview ? (
          <div className="prose-sm mx-auto max-w-3xl px-5 py-4">
            <MarkdownRenderer content={processWikiLinks(content)} />
          </div>
        ) : (
          <textarea
            id="note-textarea"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('startWriting')}
            className="h-full w-full resize-none bg-transparent px-5 py-4 font-mono text-sm text-text placeholder:text-muted/30 outline-none"
          />
        )}
      </div>

      {/* Public URL hint */}
      {note.is_public && (
        <div className="border-t border-border bg-emerald-500/5 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          {t('publicUrl')}: <code className="font-mono">/{note.slug}</code>
        </div>
      )}
    </div>
  )
}
