'use client'

import Link from 'next/link'
import { ChevronRight, Crosshair } from 'lucide-react'
import { useUserGoals } from '@/hooks/useUserGoals'
import type { Goal } from '@/types/goals'

function getStatusColor(progress: number) {
  if (progress < 0.3) return 'bg-red-500'
  if (progress <= 0.7) return 'bg-amber-500'
  return 'bg-emerald-500'
}

interface DashboardGoalsProps {
  initialGoals?: Goal[]
}

export function DashboardGoals({ initialGoals }: DashboardGoalsProps) {
  const { goals, loading, error } = useUserGoals(initialGoals)

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600/10">
            <Crosshair size={15} className="text-accent-600 dark:text-accent-400" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text">Metas</h2>
            <p className="text-xs text-muted">Resumen rápido de progreso</p>
          </div>
        </div>
        <Link
          href="/goals"
          className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Ver todas
          <ChevronRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl bg-surface-2 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
              <div className="mt-4 h-2 animate-pulse rounded-full bg-surface-3" />
              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-surface-3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : goals.length === 0 ? (
        <p className="text-sm text-muted">No tienes metas creadas todavía.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {goals.map((goal) => {
            const progress = goal.goal_progress.progress
            const percentage = Math.round(progress * 100)

            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="min-w-[260px] flex-1 rounded-xl border border-border bg-surface-2 p-4 transition-colors hover:border-border-bright hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{goal.title}</p>
                    <p className="mt-1 text-xs text-muted">{percentage}% completado</p>
                  </div>
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${getStatusColor(progress)}`} />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full rounded-full ${getStatusColor(progress)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
