'use client'

import type { Goal } from '@/types/goals'
import { GOAL_COLOR_STYLES } from '@/types/goals'
import { useGoalProgress } from '@/hooks/useGoalProgress'

interface GoalProgressCardProps {
  goal: Goal
  showTitle?: boolean
  showDetails?: boolean
  compact?: boolean
  className?: string
}

function toPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100)
}

export function GoalProgressCard({
  goal,
  showTitle = true,
  showDetails = false,
  compact = false,
  className = '',
}: GoalProgressCardProps) {
  const styles = GOAL_COLOR_STYLES[goal.color] ?? GOAL_COLOR_STYLES.blue
  const { progress, loading } = useGoalProgress(goal.id)

  const progressPct = toPercent(progress.progress)
  const habitsPct = toPercent(progress.habits_progress)
  const projectsPct = toPercent(progress.projects_progress)
  const routinesPct = toPercent(progress.routines_progress)

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-text truncate`}>
            {goal.title}
          </h3>
          <span className={`shrink-0 font-semibold ${styles.text}`}>
            {loading ? '--%' : `${progressPct}%`}
          </span>
        </div>
      )}

      {!showTitle && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Progreso</span>
          <span className={`font-semibold ${styles.text}`}>
            {loading ? '--%' : `${progressPct}%`}
          </span>
        </div>
      )}

      <div className={`mt-1.5 ${compact ? 'h-1.5' : 'h-2'} rounded-full bg-surface-hover overflow-hidden`}>
        <div
          className={[
            'h-full rounded-full transition-all duration-700',
            styles.bar,
            loading ? 'w-0' : '',
          ].join(' ')}
          style={{ width: `${loading ? 0 : progressPct}%` }}
        />
      </div>

      {showDetails && !loading && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted">
          <div className="rounded-lg bg-surface-hover px-2 py-1.5">
            <p>Habitos</p>
            <p className="mt-0.5 font-semibold text-text">{habitsPct}%</p>
          </div>
          <div className="rounded-lg bg-surface-hover px-2 py-1.5">
            <p>Proyectos</p>
            <p className="mt-0.5 font-semibold text-text">{projectsPct}%</p>
          </div>
          <div className="rounded-lg bg-surface-hover px-2 py-1.5">
            <p>Rutinas</p>
            <p className="mt-0.5 font-semibold text-text">{routinesPct}%</p>
          </div>
        </div>
      )}
    </div>
  )
}
