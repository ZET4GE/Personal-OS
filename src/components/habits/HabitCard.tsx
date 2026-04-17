'use client'

import { Check } from 'lucide-react'
import { HABIT_COLOR_STYLES } from '@/types/habits'
import type { HabitWithLogs } from '@/types/habits'
import { StreakBadge } from './StreakBadge'
import { HabitMiniCalendar } from './HabitMiniCalendar'
import { GoalSelector } from '@/components/goals/GoalSelector'
import { TagSelector } from '@/components/tags/TagSelector'

interface HabitCardProps {
  item:      HabitWithLogs
  onToggle:  (habitId: string) => void
  isLoading: boolean
}

export function HabitCard({ item, onToggle, isLoading }: HabitCardProps) {
  const { habit, todayCompleted, recentDays, streak } = item
  const styles = HABIT_COLOR_STYLES[habit.color]

  return (
    <div className={[
      'flex items-center gap-4 rounded-xl border bg-surface p-4 transition-all',
      todayCompleted
        ? 'border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/20'
        : 'border-border',
    ].join(' ')}>
      {/* Toggle button */}
      <button
        onClick={() => !isLoading && onToggle(habit.id)}
        disabled={isLoading}
        aria-label={todayCompleted ? 'Desmarcar hábito' : 'Completar hábito'}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          todayCompleted
            ? `border-transparent ${styles.bg} text-white shadow-sm`
            : `border-current ${styles.text} hover:bg-current/10`,
          isLoading ? 'opacity-50' : '',
        ].join(' ')}
      >
        {todayCompleted && <Check size={16} strokeWidth={2.5} />}
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {habit.icon && <span className="text-base leading-none">{habit.icon}</span>}
            <span className={[
              'text-sm font-semibold truncate',
              todayCompleted ? 'line-through text-muted' : '',
            ].join(' ')}>
              {habit.name}
            </span>
            {streak > 0 && <StreakBadge streak={streak} size="sm" />}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TagSelector entityId={habit.id} entityType="habit" compact />
            <GoalSelector entityId={habit.id} entityType="habit" />
          </div>
        </div>
        <HabitMiniCalendar days={recentDays} color={habit.color} />
      </div>
    </div>
  )
}
