'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Loader2, Search, Tag, X } from 'lucide-react'
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch'
import { useTags } from '@/hooks/useTags'
import type { AdvancedSearchResult, GlobalSearchResultType } from '@/types/search'

const TYPE_LABELS: Record<GlobalSearchResultType, string> = {
  project: 'Proyecto',
  goal: 'Meta',
  note: 'Nota',
  habit: 'Habito',
  routine: 'Rutina',
  roadmap: 'Roadmap',
  job: 'Empleo',
  client: 'Cliente',
  freelance: 'Freelance',
  tag: 'Tag',
}

const TYPE_ORDER: GlobalSearchResultType[] = [
  'goal',
  'project',
  'roadmap',
  'note',
  'habit',
  'routine',
  'job',
  'client',
  'freelance',
  'tag',
]

const STATUS_OPTIONS: Partial<Record<GlobalSearchResultType, { value: string; label: string }[]>> = {
  goal: [
    { value: 'active', label: 'Activas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'paused', label: 'Pausadas' },
    { value: 'abandoned', label: 'Abandonadas' },
  ],
  project: [
    { value: 'idea', label: 'Idea' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed', label: 'Completados' },
    { value: 'archived', label: 'Archivados' },
  ],
  note: [
    { value: 'private', label: 'Privadas' },
    { value: 'public', label: 'Publicas' },
  ],
  habit: [
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ],
  routine: [
    { value: 'active', label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' },
  ],
  roadmap: [
    { value: 'free', label: 'Libres' },
    { value: 'structured', label: 'Guiados' },
    { value: 'goal_based', label: 'Basados en metas' },
  ],
  job: [
    { value: 'applied', label: 'Postulado' },
    { value: 'interview', label: 'Entrevista' },
    { value: 'offer', label: 'Oferta' },
    { value: 'rejected', label: 'Rechazado' },
  ],
  freelance: [
    { value: 'proposal', label: 'Propuesta' },
    { value: 'active', label: 'Activo' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' },
  ],
}

function getRouteByType(type: GlobalSearchResultType, id: string): string {
  if (type === 'goal') return `/goals/${id}`
  if (type === 'roadmap') return `/roadmaps/${id}`
  if (type === 'freelance') return `/freelance/${id}`
  if (type === 'client') return `/clients/${id}`
  if (type === 'job') return '/jobs'
  if (type === 'project') return '/projects'
  if (type === 'note') return '/notes'
  if (type === 'habit') return '/habits'
  if (type === 'routine') return '/routines'
  return `/search?tag=${id}`
}

export function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagId = searchParams.get('tag')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<GlobalSearchResultType | 'all'>('all')
  const [selectedTagId, setSelectedTagId] = useState<string | null>(tagId)
  const [statusFilter, setStatusFilter] = useState('all')
  const { tags, loading: tagsLoading } = useTags()
  const statusOptions = typeFilter === 'all' ? [] : (STATUS_OPTIONS[typeFilter] ?? [])
  const { results, loading, error, active } = useAdvancedSearch({
    query,
    type: typeFilter,
    tagId: selectedTagId,
    status: statusFilter,
  })

  useEffect(() => {
    setSelectedTagId(tagId)
  }, [tagId])

  useEffect(() => {
    setStatusFilter('all')
  }, [typeFilter])

  const filteredResults = useMemo(() => {
    return results
  }, [results])

  const groupedResults = useMemo(() => {
    const groups = new Map<GlobalSearchResultType, AdvancedSearchResult[]>()

    for (const item of filteredResults) {
      const current = groups.get(item.type) ?? []
      current.push(item)
      groups.set(item.type, current)
    }

    return TYPE_ORDER
      .map((type) => ({ type, items: groups.get(type) ?? [] }))
      .filter((group) => group.items.length > 0)
  }, [filteredResults])

  function openResult(item: AdvancedSearchResult) {
    router.push(getRouteByType(item.type, item.id))
  }

  function clearFilters() {
    setQuery('')
    setTypeFilter('all')
    setSelectedTagId(null)
    setStatusFilter('all')
    router.replace('/search')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-muted">Busqueda global</p>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Encontrar cualquier cosa</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Busca metas, proyectos, notas, habitos, rutinas y tags desde un solo lugar.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en todo..."
              autoFocus
              className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-10 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600"
            />
          </div>
          <div className="relative">
            <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as GlobalSearchResultType | 'all')}
              className="w-full rounded-xl border border-border bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600 [&>option]:bg-zinc-950"
            >
              <option value="all">Todo</option>
              {TYPE_ORDER.map((type) => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Tag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={selectedTagId ?? 'all'}
              onChange={(event) => setSelectedTagId(event.target.value === 'all' ? null : event.target.value)}
              className="w-full rounded-xl border border-border bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600 [&>option]:bg-zinc-950"
            >
              <option value="all">{tagsLoading ? 'Cargando tags...' : 'Todos los tags'}</option>
              {tags.map((tagItem) => (
                <option key={tagItem.id} value={tagItem.id}>{tagItem.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              disabled={statusOptions.length === 0}
              className="w-full rounded-xl border border-border bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-zinc-950"
            >
              <option value="all">Todos los estados</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            <X size={15} />
            Limpiar
          </button>
        </div>

        {selectedTagId ? (
          <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            Filtro por tag activo. Los resultados se limitan a elementos vinculados a esa etiqueta.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        {!active ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="text-sm font-medium text-text">Escribi para buscar</p>
            <p className="mt-1 text-sm text-muted">Tambien podes filtrar por modulo, tag o estado.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 px-2 py-8 text-sm text-muted">
            <Loader2 size={15} className="animate-spin" />
            Buscando...
          </div>
        ) : error ? (
          <p className="px-2 py-8 text-sm text-red-500">{error}</p>
        ) : groupedResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="text-sm font-medium text-text">Sin resultados</p>
            <p className="mt-1 text-sm text-muted">Proba con otro termino o cambia el filtro.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groupedResults.map((group) => (
              <div key={group.type}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {TYPE_LABELS[group.type]}
                </p>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => openResult(item)}
                      className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-left transition-all hover:border-border-bright hover:bg-surface-hover active:scale-[0.99]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium text-text">{item.title}</p>
                        <div className="flex flex-wrap justify-end gap-1">
                          {item.status ? (
                            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
                              {item.status}
                            </span>
                          ) : null}
                          {item.tags.slice(0, 3).map((tagName) => (
                            <span key={tagName} className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">
                              {tagName}
                            </span>
                          ))}
                        </div>
                      </div>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.description}</p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-muted">
                        Actualizado {new Date(item.updated_at).toLocaleDateString('es-AR')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
