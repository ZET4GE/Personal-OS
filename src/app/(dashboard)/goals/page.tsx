import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoals, getGoalStats } from '@/services/goals'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalStats } from '@/components/goals/GoalStats'
import type { GoalStatus, GoalCategory } from '@/types/goals'
import { GOAL_CATEGORIES, CATEGORY_META } from '@/types/goals'

export const metadata: Metadata = { title: 'Metas' }

const STATUS_TABS: { key: GoalStatus | 'all'; label: string }[] = [
  { key: 'all',       label: 'Todas'      },
  { key: 'active',    label: 'Activas'    },
  { key: 'completed', label: 'Completadas'},
  { key: 'paused',    label: 'Pausadas'   },
]

interface SearchParams {
  status?:   string
  category?: string
}

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: statusParam, category: categoryParam } = await searchParams

  const status   = STATUS_TABS.some((t) => t.key === statusParam) ? statusParam as GoalStatus | 'all' : 'all'
  const category = GOAL_CATEGORIES.includes(categoryParam as GoalCategory) ? categoryParam as GoalCategory : undefined

  const [goalsResult, statsResult] = await Promise.all([
    getGoals(supabase, user.id, {
      status:   status === 'all' ? undefined : status,
      category,
    }),
    getGoalStats(supabase, user.id),
  ])

  const goals = goalsResult.data ?? []
  const stats = statsResult.data ?? { total: 0, active: 0, completed: 0, paused: 0, avgProgress: 0 }

  return (
    <div className="flex flex-col gap-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            <span className="gradient-text">Mis Metas</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Seguí tu progreso hacia tus objetivos más importantes
          </p>
        </div>
        <Link
          href="/goals/new"
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus size={15} />
          Nueva meta
        </Link>
      </div>

      {/* Stats */}
      <GoalStats stats={stats} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {STATUS_TABS.map((tab) => {
            const isActive = tab.key === status
            const params = new URLSearchParams()
            if (tab.key !== 'all') params.set('status', tab.key)
            if (category) params.set('category', category)
            const href = `/goals${params.size ? `?${params}` : ''}`

            return (
              <Link
                key={tab.key}
                href={href}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground',
                ].join(' ')}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={`/goals${status !== 'all' ? `?status=${status}` : ''}`}
            className={[
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border',
              !category
                ? 'border-accent-600 bg-accent-600/10 text-accent-600'
                : 'border-border text-muted hover:border-border-bright',
            ].join(' ')}
          >
            Todas
          </Link>
          {GOAL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const isSelected = category === cat
            const params = new URLSearchParams()
            if (status !== 'all') params.set('status', status)
            params.set('category', cat)
            const href = `/goals?${params}`

            return (
              <Link
                key={cat}
                href={href}
                className={[
                  'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border',
                  isSelected
                    ? 'border-accent-600 bg-accent-600/10 text-accent-600'
                    : 'border-border text-muted hover:border-border-bright',
                ].join(' ')}
              >
                <span>{meta.icon}</span>
                {meta.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <h3 className="text-base font-semibold text-text mb-1">No hay metas aún</h3>
          <p className="text-sm text-muted mb-4">
            {status === 'all'
              ? 'Creá tu primera meta para empezar a trackear tu progreso'
              : `No tenés metas con estado "${status}"`}
          </p>
          <Link
            href="/goals/new"
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            <Plus size={14} />
            Crear mi primera meta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
