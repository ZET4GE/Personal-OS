'use client'

import { useState, useTransition, useMemo } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Note, NoteFolder } from '@/types/notes'
import { FolderTree } from './FolderTree'
import { TagCloud } from './TagCloud'
import { NoteCard } from './NoteCard'
import { NoteEditor } from './NoteEditor'
import { createNoteAction } from '@/app/(dashboard)/notes/actions'

interface Props {
  notes:    Note[]
  folders:  NoteFolder[]
  tags:     string[]
}

export function NotesLayout({ notes, folders, tags }: Props) {
  const t = useTranslations('notes')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedTag,      setSelectedTag]      = useState<string | null>(null)
  const [selectedNote,     setSelectedNote]      = useState<Note | null>(null)
  const [searchQuery,      setSearchQuery]       = useState('')
  const [pending, start] = useTransition()

  // Compute counts
  const noteCount = useMemo(() => {
    const map: Record<string, number> = {}
    for (const n of notes) {
      if (n.folder_id && !n.is_archived) {
        map[n.folder_id] = (map[n.folder_id] ?? 0) + 1
      }
    }
    return map
  }, [notes])

  const totalCount    = notes.filter((n) => !n.is_archived).length
  const archivedCount = notes.filter((n) =>  n.is_archived).length
  const pinnedCount   = notes.filter((n) =>  n.is_pinned && !n.is_archived).length

  // Filter notes
  const filteredNotes = useMemo(() => {
    let list = notes

    if (selectedFolderId === 'archived') {
      list = list.filter((n) => n.is_archived)
    } else if (selectedFolderId === 'pinned') {
      list = list.filter((n) => n.is_pinned && !n.is_archived)
    } else if (selectedFolderId !== null) {
      list = list.filter((n) => n.folder_id === selectedFolderId && !n.is_archived)
    } else {
      list = list.filter((n) => !n.is_archived)
    }

    if (selectedTag) {
      list = list.filter((n) => n.tags.includes(selectedTag))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((tag) => tag.includes(q)),
      )
    }

    return list
  }, [notes, selectedFolderId, selectedTag, searchQuery])

  function handleNewNote() {
    const fd = new FormData()
    if (selectedFolderId && selectedFolderId !== 'pinned' && selectedFolderId !== 'archived') {
      fd.set('folder_id', selectedFolderId)
    }
    start(async () => {
      const result = await createNoteAction(fd)
      if ('note' in result && result.note) {
        setSelectedNote(result.note)
      }
    })
  }

  // Keep selectedNote in sync with updated note list
  const currentNote = selectedNote
    ? (notes.find((n) => n.id === selectedNote.id) ?? selectedNote)
    : null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Col 1: Folder sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-surface px-3 py-4 lg:flex">
        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          noteCount={noteCount}
          totalCount={totalCount}
          archivedCount={archivedCount}
          pinnedCount={pinnedCount}
        />
        <TagCloud
          tags={tags}
          selectedTag={selectedTag}
          onSelect={setSelectedTag}
        />
      </aside>

      {/* ── Col 2: Note list ── */}
      <div className={`flex w-full flex-col border-r border-border bg-surface-2 lg:w-72 xl:w-80 ${currentNote ? 'hidden lg:flex' : 'flex'}`}>
        {/* Search + new */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full rounded-lg border border-border bg-surface py-1.5 pl-7 pr-7 text-sm outline-none transition-all duration-200 focus:border-accent-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-text"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={handleNewNote}
            disabled={pending}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-accent-600 px-2.5 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={13} /> {pending ? 'Creando...' : t('new')}
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2">
          {filteredNotes.length === 0 ? (
            <div className="animate-fade-in flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted">{searchQuery ? t('noResults') : t('noNotes')}</p>
              {!searchQuery && (
                <button
                  onClick={handleNewNote}
                  disabled={pending}
                  className="cursor-pointer text-xs text-accent-600 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('createFirst')}
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                active={currentNote?.id === note.id}
                onClick={() => setSelectedNote(note)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Col 3: Editor ── */}
      <div className={`flex-1 overflow-hidden bg-surface ${currentNote ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
        {currentNote ? (
          <NoteEditor key={currentNote.id} note={currentNote} />
        ) : (
          <div className="animate-fade-in flex h-full flex-col items-center justify-center gap-4 text-center text-muted">
            <p className="text-sm">{t('selectNote')}</p>
            <button
              onClick={handleNewNote}
              disabled={pending}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} /> {pending ? 'Creando...' : t('newNote')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
