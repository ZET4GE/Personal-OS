'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, Tags } from 'lucide-react'
import { toast } from 'sonner'
import { useTags } from '@/hooks/useTags'
import { getEntityTagIds, linkTagToEntity, type TagEntityType } from '@/services/tags'

interface TagSelectorProps {
  entityId: string
  entityType: TagEntityType
  className?: string
  align?: 'left' | 'right'
  compact?: boolean
}

export function TagSelector({
  entityId,
  entityType,
  className = '',
  align = 'right',
  compact = false,
}: TagSelectorProps) {
  const { tags, loading, error, createUserTag } = useTags()
  const [open, setOpen] = useState(false)
  const [linkedTagIds, setLinkedTagIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLinks, setIsLoadingLinks] = useState(true)

  useEffect(() => {
    let active = true

    async function loadLinks() {
      setIsLoadingLinks(true)
      const result = await getEntityTagIds(entityType, entityId)

      if (!active) return

      if (result.error) {
        toast.error(result.error)
        setLinkedTagIds([])
      } else {
        setLinkedTagIds(result.data ?? [])
      }

      setIsLoadingLinks(false)
    }

    void loadLinks()
    return () => {
      active = false
    }
  }, [entityId, entityType])

  const availableSelectedIds = useMemo(
    () => selectedTagIds.filter((tagId) => !linkedTagIds.includes(tagId)),
    [linkedTagIds, selectedTagIds],
  )

  function toggleTag(tagId: string) {
    if (linkedTagIds.includes(tagId)) return

    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    )
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return

    const createdTag = await createUserTag(newTagName)
    if (!createdTag) {
      toast.error('No se pudo crear el tag')
      return
    }

    setSelectedTagIds((current) =>
      current.includes(createdTag.id) ? current : [...current, createdTag.id],
    )
    setNewTagName('')
    toast.success('Tag creado')
  }

  async function handleLinkTags() {
    if (availableSelectedIds.length === 0) {
      toast.error('Selecciona al menos un tag')
      return
    }

    setIsSubmitting(true)

    for (const tagId of availableSelectedIds) {
      const result = await linkTagToEntity(tagId, entityType, entityId)
      if (!result.ok) {
        setIsSubmitting(false)
        toast.error(result.error)
        return
      }
    }

    setLinkedTagIds((current) => Array.from(new Set([...current, ...availableSelectedIds])))
    setSelectedTagIds([])
    setIsSubmitting(false)
    setOpen(false)
    toast.success('Tags vinculados')
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
          compact
            ? 'text-muted hover:bg-surface-hover hover:text-foreground'
            : 'border border-border bg-surface-2 text-muted hover:border-border-bright hover:text-foreground',
        ].join(' ')}
      >
        <Tags size={13} />
        Tags
      </button>

      {open && (
        <div
          className={[
            'absolute z-30 mt-2 w-72 rounded-xl border border-border bg-surface p-3 shadow-lg',
            align === 'left' ? 'left-0' : 'right-0',
          ].join(' ')}
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Tags size={14} />
            Gestionar tags
          </div>

          <div className="mb-3 flex gap-2">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nuevo tag"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent-600"
            />
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-accent-600 px-3 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>

          {loading || isLoadingLinks ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 size={13} className="animate-spin" />
              Cargando tags...
            </div>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : tags.length === 0 ? (
            <p className="text-xs text-muted">No tienes tags creados.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isLinked = linkedTagIds.includes(tag.id)
                const isSelected = selectedTagIds.includes(tag.id)

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={[
                      'rounded-full border px-2.5 py-1 text-xs transition-colors',
                      isLinked
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : isSelected
                        ? 'border-accent-600 bg-accent-600/10 text-accent-600'
                        : 'border-border bg-surface-2 text-muted hover:border-border-bright hover:text-foreground',
                    ].join(' ')}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleLinkTags}
            disabled={isSubmitting || availableSelectedIds.length === 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Vincular
          </button>
        </div>
      )}
    </div>
  )
}
