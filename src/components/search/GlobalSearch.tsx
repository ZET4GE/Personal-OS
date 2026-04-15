'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import type { GlobalSearchResult, GlobalSearchResultType } from '@/types/search'

const TYPE_LABELS: Record<GlobalSearchResultType, string> = {
  project: 'Proyecto',
  goal: 'Meta',
  note: 'Nota',
  habit: 'Habito',
  routine: 'Rutina',
  tag: 'Tag',
}

const TYPE_ORDER: GlobalSearchResultType[] = ['project', 'goal', 'note', 'habit', 'routine', 'tag']

function getRouteByType(type: GlobalSearchResultType, id: string): string {
  switch (type) {
    case 'project':
      return `/projects/${id}`
    case 'goal':
      return `/goals/${id}`
    case 'note':
      return `/notes/${id}`
    case 'habit':
      return '/habits'
    case 'routine':
      return '/routines'
    case 'tag':
      return `/search?tag=${id}`
    default:
      return '/dashboard'
  }
}

export function GlobalSearch() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { results, loading, error } = useGlobalSearch(query)

  const groupedResults = useMemo(() => {
    const groups = new Map<GlobalSearchResultType, GlobalSearchResult[]>()

    for (const result of results) {
      const current = groups.get(result.type) ?? []
      current.push(result)
      groups.set(result.type, current)
    }

    return TYPE_ORDER
      .map((type) => ({
        type,
        items: groups.get(type) ?? [],
      }))
      .filter((group) => group.items.length > 0)
  }, [results])

  const showResults = focused && query.trim().length > 0

  const handleClick = (item: GlobalSearchResult) => {
    console.log('click', item)
    setFocused(false)
    setQuery('')
    router.push(getRouteByType(item.type, item.id))
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    item: GlobalSearchResult,
  ) => {
    e.preventDefault()
    handleClick(item)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-md overflow-visible">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar en todo..."
          className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600"
        />
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[9999] max-h-[28rem] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-lg">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              Buscando...
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-sm text-red-500">{error}</p>
          ) : groupedResults.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">Sin resultados</p>
          ) : (
            <div className="space-y-2">
              {groupedResults.map((group) => (
                <div key={group.type}>
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {TYPE_LABELS[group.type]}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        onMouseDown={(e) => handleMouseDown(e, item)}
                        className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <span className="text-sm text-text">
                          [{TYPE_LABELS[item.type]}] {item.title}
                        </span>
                        {item.description && (
                          <span className="line-clamp-1 text-xs text-muted">
                            {item.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
