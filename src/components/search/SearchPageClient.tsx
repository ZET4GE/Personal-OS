'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Loader2, Search } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { getTaggedEntities } from '@/services/tags'
import type { GlobalSearchResult, GlobalSearchResultType } from '@/types/search'

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
  const globalSearch = useGlobalSearch(tagId ? '' : query)
  const [tagResults, setTagResults] = useState<GlobalSearchResult[]>([])
  const [tagLoading, setTagLoading] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)
  const results = tagId ? tagResults : globalSearch.results
  const loading = tagId ? tagLoading : globalSearch.loading
  const error = tagId ? tagError : globalSearch.error

  useEffect(() => {
    if (!tagId) return

    let active = true
    const timer = window.setTimeout(async () => {
      setTagLoading(true)
      setTagError(null)

      const result = await getTaggedEntities(tagId, query)
      if (!active) return

      if (result.error) {
        setTagResults([])
        setTagError(result.error)
      } else {
        setTagResults(result.data ?? [])
      }

      setTagLoading(false)
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query, tagId])

  const filteredResults = useMemo(() => {
    if (typeFilter === 'all') return results
    return results.filter((item) => item.type === typeFilter)
  }, [results, typeFilter])

  const groupedResults = useMemo(() => {
    const groups = new Map<GlobalSearchResultType, GlobalSearchResult[]>()

    for (const item of filteredResults) {
      const current = groups.get(item.type) ?? []
      current.push(item)
      groups.set(item.type, current)
    }

    return TYPE_ORDER
      .map((type) => ({ type, items: groups.get(type) ?? [] }))
      .filter((group) => group.items.length > 0)
  }, [filteredResults])

  function openResult(item: GlobalSearchResult) {
    router.push(getRouteByType(item.type, item.id))
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
        <div className="flex flex-col gap-3 md:flex-row">
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
          <div className="relative md:w-52">
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
        </div>

        {tagId ? (
          <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            Filtro por tag activo. Los resultados se limitan a elementos vinculados a esa etiqueta.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        {!query.trim() && !tagId ? (
          <div className="rounded-xl border border-dashed border-border py-14 text-center">
            <p className="text-sm font-medium text-text">Escribi para buscar</p>
            <p className="mt-1 text-sm text-muted">Los resultados aparecen agrupados por modulo.</p>
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
                      <p className="text-sm font-medium text-text">{item.title}</p>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.description}</p>
                      ) : null}
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
