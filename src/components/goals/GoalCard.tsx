'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { CalendarDays, CheckCircle2, ChevronRight } from 'lucide-react'
import type { Goal } from '@/types/goals'
import { GOAL_COLOR_STYLES, PRIORITY_META } from '@/types/goals'
import { CategoryBadge } from './CategoryBadge'
import { toggleGoalStatusAction } from '@/app/(dashboard)/goals/actions'
import { GoalProgressCard } from './GoalProgressCard'

function daysLeft(dateStr: string | null): string | null {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return 'Vencida'
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return `${diff} días`
}

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const [isPending, start] = useTransition()
  const styles = GOAL_COLOR_STYLES[goal.color] ?? GOAL_COLOR_STYLES.blue
  const priority = PRIORITY_META[goal.priority]
  const days = daysLeft(goal.target_date)
  const daysOverdue = goal.target_date && new Date(goal.target_date) < new Date() && goal.status === 'active'

  function handleComplete() {
    const fd = new FormData()
    fd.set('id', goal.id)
    fd.set('status', 'completed')
    start(async () => { await toggleGoalStatusAction(fd) })
  }

  return (
    <div
      className={`group relative overflow-hidden flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)] ${isPending ? 'opacity-60' : ''}`}
    >
      {/* Color top bar */}
      <div className={`absolute inset-x-0 top-0 h-[3px] ${styles.bar} opacity-70`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {goal.icon && <span className="text-xl shrink-0">{goal.icon}</span>}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text truncate leading-tight">{goal.title}</h3>
            <p className={`text-[11px] font-medium mt-0.5 ${priority.color}`}>{priority.label} prioridad</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {goal.status === 'active' && (
            <button
              onClick={handleComplete}
              disabled={isPending}
              title="Marcar como completada"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-emerald-500"
            >
              <CheckCircle2 size={15} />
            </button>
          )}
          <Link
            href={`/goals/${goal.id}`}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            title="Ver detalle"
          >
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-xs text-muted leading-relaxed line-clamp-2">{goal.description}</p>
      )}

      <GoalProgressCard goal={goal} showTitle={false} showDetails />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <CategoryBadge category={goal.category} />
        {days && (
          <span className={`flex items-center gap-1 text-[11px] font-medium ${daysOverdue ? 'text-red-500' : 'text-muted'}`}>
            <CalendarDays size={12} />
            {days}
          </span>
        )}
      </div>
    </div>
  )
}
