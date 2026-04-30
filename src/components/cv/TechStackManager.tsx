'use client'

import { useState, useOptimistic, useTransition, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, X, Search, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { addTechAction, removeTechAction, reorderTechStackAction } from '@/app/(dashboard)/cv/actions'
import { TechIcon } from './TechIcon'
import { TECH_CATALOG, CATALOG_BY_SLUG, searchCatalog } from '@/lib/tech-catalog'
import { TECH_CATEGORY_LABELS } from '@/types/tech-stack'
import type { UserTechStack, TechCategory } from '@/types/tech-stack'
import type { TechCatalogItem } from '@/types/tech-stack'

// ─────────────────────────────────────────────────────────────
// Sortable card
// ─────────────────────────────────────────────────────────────

function SortableTechCard({
  item,
  onRemove,
}: {
  item: UserTechStack & { isOptimistic?: boolean }
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const catalogEntry = CATALOG_BY_SLUG.get(item.tech_slug)
  const icon = catalogEntry?.icon ?? { type: 'none' as const }

  return (
    <div
      ref={setNodeRef}
      style={{ borderColor: 'var(--color-border)', transform: CSS.Transform.toString(transform), transition }}
      className={[
        'group relative flex flex-col items-center gap-2 rounded-xl border bg-surface p-3 text-center transition-shadow',
        isDragging        ? 'z-10 shadow-lg opacity-80' : 'hover:shadow-sm',
        item.isOptimistic ? 'opacity-50'                : '',
      ].join(' ')}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1.5 top-1.5 cursor-grab touch-none rounded p-0.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Arrastrar"
        tabIndex={-1}
      >
        <GripVertical size={13} />
      </button>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        disabled={item.isOptimistic}
        className="absolute right-1.5 top-1.5 rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 disabled:opacity-30"
        aria-label="Quitar"
      >
        <X size={13} />
      </button>

      <TechIcon name={item.tech_name} icon={icon} size={40} />
      <p className="w-full truncate text-[11px] font-medium leading-tight text-text">{item.tech_name}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Search / add panel
// ─────────────────────────────────────────────────────────────

const CUSTOM_CATEGORY_OPTIONS: { value: TechCategory; label: string }[] = [
  { value: 'language',  label: 'Lenguaje' },
  { value: 'framework', label: 'Framework' },
  { value: 'tool',      label: 'Herramienta' },
  { value: 'platform',  label: 'Plataforma' },
  { value: 'vendor',    label: 'Vendor' },
  { value: 'other',     label: 'Otro' },
]

function AddTechPanel({
  existingSlugs,
  onAdd,
}: {
  existingSlugs: Set<string>
  onAdd: (item: { tech_name: string; tech_slug: string; category: TechCategory }) => void
}) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<TechCatalogItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [customMode, setCustomMode]     = useState(false)
  const [customName, setCustomName]     = useState('')
  const [customCat, setCustomCat]       = useState<TechCategory>('tool')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }
    const found = searchCatalog(query, 8).filter((t) => !existingSlugs.has(t.slug))
    setResults(found)
    setShowDropdown(true)
  }, [query, existingSlugs])

  function handleSelect(item: TechCatalogItem) {
    onAdd({ tech_name: item.name, tech_slug: item.slug, category: item.category })
    setQuery('')
    setResults([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  function handleAddCustom(e: React.FormEvent) {
    e.preventDefault()
    if (!customName.trim()) return
    const slug = customName.trim().toLowerCase().replace(/\s+/g, '-')
    onAdd({ tech_name: customName.trim(), tech_slug: slug, category: customCat })
    setCustomName('')
    setCustomMode(false)
  }

  // Check if query matches no catalog item — offer custom add
  const hasNoMatch = query.trim().length > 0 && results.length === 0

  return (
    <div className="rounded-xl border bg-surface p-4" style={{ borderColor: 'var(--color-border)' }}>
      {!customMode ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted">Buscar tecnología del catálogo</p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Python, Docker, Cisco..."
              className={inputCls + ' pl-8'}
            />

            {showDropdown && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border bg-surface shadow-lg" style={{ borderColor: 'var(--color-border)' }}>
                {results.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onMouseDown={() => handleSelect(item)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-surface-hover"
                  >
                    <TechIcon name={item.name} icon={item.icon} size={24} />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-xs text-muted">{TECH_CATEGORY_LABELS[item.category]}</span>
                  </button>
                ))}
                {hasNoMatch && (
                  <button
                    type="button"
                    onMouseDown={() => { setCustomMode(true); setCustomName(query); setQuery('') }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-accent-600 hover:bg-surface-hover"
                  >
                    <Plus size={14} />
                    Agregar "{query}" como tecnología custom
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddCustom} className="space-y-3">
          <p className="text-xs font-medium text-muted">Tecnología personalizada</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre"
              required
              className={inputCls + ' flex-1'}
              autoFocus
            />
            <select
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value as TechCategory)}
              className={inputCls + ' w-36 shrink-0'}
            >
              {CUSTOM_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white">
              <Plus size={13} /> Agregar
            </button>
            <button type="button" onClick={() => setCustomMode(false)} className="rounded-lg border px-3 py-1.5 text-xs font-medium" style={{ borderColor: 'var(--color-border)' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

type OptimisticItem = UserTechStack & { isOptimistic?: boolean }

export function TechStackManager({ items }: { items: UserTechStack[] }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const [optimistic, setOptimistic] = useState<OptimisticItem[]>(items)
  const [, startTransition]         = useTransition()

  // Keep in sync with server refetch
  useEffect(() => { setOptimistic(items) }, [items])

  const existingSlugs = new Set(optimistic.map((i) => i.tech_slug))

  function handleAdd(input: { tech_name: string; tech_slug: string; category: TechCategory }) {
    const tempId = `temp-${Date.now()}`
    const tempItem: OptimisticItem = {
      id:            tempId,
      user_id:       '',
      tech_name:     input.tech_name,
      tech_slug:     input.tech_slug,
      category:      input.category,
      display_order: optimistic.length,
      created_at:    new Date().toISOString(),
      updated_at:    new Date().toISOString(),
      isOptimistic:  true,
    }
    setOptimistic((prev) => [...prev, tempItem])

    startTransition(async () => {
      const fd = new FormData()
      fd.set('tech_name', input.tech_name)
      fd.set('tech_slug', input.tech_slug)
      fd.set('category', input.category)
      const result = await addTechAction(fd)
      if (result.error) {
        toast.error(result.error)
        setOptimistic((prev) => prev.filter((i) => i.id !== tempId))
      } else {
        toast.success(`${input.tech_name} agregado`)
      }
    })
  }

  function handleRemove(id: string) {
    setOptimistic((prev) => prev.filter((i) => i.id !== id))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', id)
      const result = await removeTechAction(fd)
      if (result.error) {
        toast.error(result.error)
        // Restore (we've lost the item, so just show error; page revalidates)
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = optimistic.findIndex((i) => i.id === active.id)
    const newIndex = optimistic.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(optimistic, oldIndex, newIndex)
    setOptimistic(reordered)

    startTransition(async () => {
      const fd = new FormData()
      fd.set('ordered_ids', JSON.stringify(reordered.map((i) => i.id)))
      const result = await reorderTechStackAction(fd)
      if (result.error) toast.error(result.error)
    })
  }

  // Group by category for display
  const categories = [...new Set(optimistic.map((i) => i.category))] as TechCategory[]

  return (
    <div className="space-y-6">
      <AddTechPanel existingSlugs={existingSlugs} onAdd={handleAdd} />

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Layers size={28} className="mb-3 text-muted" />
          <p className="font-medium">Sin tecnologías todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Buscá Python, Docker, Cisco… y armá tu stack visual.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={optimistic.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="space-y-5">
              {categories.map((cat) => {
                const catItems = optimistic.filter((i) => i.category === cat)
                if (catItems.length === 0) return null
                return (
                  <div key={cat}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                      {TECH_CATEGORY_LABELS[cat]}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {catItems.map((item) => (
                        <SortableTechCard key={item.id} item={item} onRemove={handleRemove} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {optimistic.length > 0 && (
        <p className="text-center text-xs text-muted">
          Arrastrá las cards para reordenar · {optimistic.length} {optimistic.length === 1 ? 'tecnología' : 'tecnologías'}
        </p>
      )}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:bg-slate-900 placeholder:text-slate-400'
