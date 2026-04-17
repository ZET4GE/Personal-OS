'use client'

import { createPortal } from 'react-dom'
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
  switch (type) {
    case 'project':
      return '/projects'
    case 'goal':
      return `/goals/${id}`
    case 'roadmap':
      return `/roadmaps/${id}`
    case 'job':
      return '/jobs'
    case 'client':
      return `/clients/${id}`
    case 'freelance':
      return `/freelance/${id}`
    case 'note':
      return '/notes'
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
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
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
    router.push(getRouteByType(item.type, item.id))
    setQuery('')
    setFocused(false)
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    item: GlobalSearchResult,
  ) => {
    e.preventDefault()
    handleClick(item)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()

    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [query, focused])

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
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar en todo..."
          className="w-full rounded-xl border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm text-text outline-none transition-colors focus:border-accent-600"
        />
      </div>

      {mounted && showResults && createPortal(
        <div
          className="max-h-[28rem] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-xl"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999,
          }}
        >
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
        </div>,
        document.body,
      )}
    </div>
  )
}
