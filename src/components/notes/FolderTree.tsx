'use client'

import { useState, useTransition } from 'react'
import type { ElementType } from 'react'
import { Folder, FolderOpen, Plus, Trash2, Archive, Pin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { NoteFolder } from '@/types/notes'
import { FOLDER_COLOR_CLASS } from '@/types/notes'
import { createFolderAction, deleteFolderAction } from '@/app/(dashboard)/notes/actions'

interface Props {
  folders:          NoteFolder[]
  selectedFolderId: string | null   // null = todas, 'archived' = archivadas
  onSelect:         (id: string | null) => void
  noteCount:        Record<string, number>   // folderId → count
  totalCount:       number
  archivedCount:    number
  pinnedCount:      number
}

interface NavItemProps {
  id: string | null
  label: string
  icon: ElementType
  count: number
  active: boolean
  onSelect: (id: string | null) => void
}

function NavItem({
  id, label, icon: Icon, count, active, onSelect,
}: NavItemProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`group flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? 'bg-accent-600/10 text-accent-600 font-medium'
          : 'text-muted hover:bg-surface-hover hover:text-text'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon size={14} className="shrink-0" />
        {label}
      </span>
      <span className={`text-xs tabular-nums ${active ? 'text-accent-600/80' : 'text-muted/60'}`}>
        {count}
      </span>
    </button>
  )
}

export function FolderTree({
  folders, selectedFolderId, onSelect,
  noteCount, totalCount, archivedCount, pinnedCount,
}: Props) {
  const t = useTranslations('notes')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [pending, start] = useTransition()

  function handleCreate() {
    if (!newName.trim()) { setAdding(false); return }
    const fd = new FormData()
    fd.set('name', newName.trim())
    start(async () => {
      await createFolderAction(fd)
      setNewName('')
      setAdding(false)
    })
  }

  function handleDelete(folderId: string) {
    const fd = new FormData()
    fd.set('id', folderId)
    start(async () => {
      await deleteFolderAction(fd)
      if (selectedFolderId === folderId) onSelect(null)
    })
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Fixed sections */}
      <NavItem id={null} label={t('allNotes')} icon={FolderOpen} count={totalCount} active={selectedFolderId === null} onSelect={onSelect} />
      <NavItem id="pinned" label={t('pinned')} icon={Pin} count={pinnedCount} active={selectedFolderId === 'pinned'} onSelect={onSelect} />
      <NavItem id="archived" label={t('archived')} icon={Archive} count={archivedCount} active={selectedFolderId === 'archived'} onSelect={onSelect} />

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5">
          <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted/60 select-none">
            {t('folders')}
          </p>
          {folders.map((folder) => (
            <div key={folder.id} className="group flex items-center gap-1">
              <button
                onClick={() => onSelect(folder.id)}
                className={`flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-accent-600/10 text-accent-600 font-medium'
                    : 'text-muted hover:bg-surface-hover hover:text-text'
                }`}
              >
                <Folder size={14} className={`shrink-0 ${FOLDER_COLOR_CLASS[folder.color]}`} />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-xs tabular-nums text-muted/60">
                  {noteCount[folder.id] ?? 0}
                </span>
              </button>
              <button
                onClick={() => handleDelete(folder.id)}
                disabled={pending}
                className="shrink-0 rounded p-1 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add folder */}
      <div className="mt-2 px-1">
        {adding ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setAdding(false); setNewName('') }
            }}
            placeholder={t('folderName')}
            className="w-full rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm outline-none focus:border-accent-600"
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
          >
            <Plus size={12} /> {t('newFolder')}
          </button>
        )}
      </div>
    </div>
  )
}
