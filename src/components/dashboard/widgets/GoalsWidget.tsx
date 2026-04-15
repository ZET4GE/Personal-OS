import Link from 'next/link'
import { ChevronRight, Plus, Crosshair } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getTopGoals } from '@/services/goals'
import { CATEGORY_META } from '@/types/goals'
import { GoalProgressCard } from '@/components/goals/GoalProgressCard'

interface GoalsWidgetProps {
  userId: string
}

export async function GoalsWidget({ userId }: GoalsWidgetProps) {
  const supabase = await createClient()
  const result   = await getTopGoals(supabase, userId, 3)
  const goals    = result.data ?? []

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600/10">
            <Crosshair size={14} className="text-accent-600 dark:text-accent-400" />
          </span>
          <h2 className="text-sm font-semibold text-text">Mis Metas</h2>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Ver todas
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
          <p className="text-2xl">🎯</p>
          <p className="text-sm text-muted">No hay metas activas</p>
          <Link
            href="/goals/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-700 mt-1"
          >
            <Plus size={12} />
            Crear meta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const category = CATEGORY_META[goal.category]

            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover"
              >
                {/* Icon */}
                <span className="shrink-0 text-xl">{goal.icon ?? category.icon}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-text group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                    {goal.title}
                  </p>
                  <GoalProgressCard goal={goal} showTitle={false} compact className="mt-1.5" />
                </div>

                <ChevronRight size={14} className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </div>
      )}

      {goals.length > 0 && (
        <Link
          href="/goals/new"
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted transition-colors hover:border-border-bright hover:text-foreground"
        >
          <Plus size={12} />
          Nueva meta
        </Link>
      )}
    </div>
  )
}
