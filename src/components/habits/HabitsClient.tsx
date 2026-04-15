'use client'

import Link from 'next/link'
import { useOptimistic, useTransition, useRef } from 'react'
import { Target } from 'lucide-react'
import { toast } from 'sonner'
import { toggleHabitLogAction } from '@/app/(dashboard)/habits/actions'
import { HabitCard } from './HabitCard'
import { DayNavigator } from './DayNavigator'
import type { HabitWithLogs } from '@/types/habits'

type OptItem = HabitWithLogs & { isPending?: boolean }

function reducer(
  state: OptItem[],
  op: { type: 'toggle'; habitId: string },
): OptItem[] {
  return state.map((item) => {
    if (item.habit.id !== op.habitId) return item
    const newCompleted = !item.todayCompleted
    // Optimistically update streak
    const streakDelta  = newCompleted ? 1 : -1
    return {
      ...item,
      todayCompleted: newCompleted,
      streak:         Math.max(0, item.streak + streakDelta),
      isPending:      true,
    }
  })
}

interface HabitsClientProps {
  items: HabitWithLogs[]
  date:  string   // 'YYYY-MM-DD'
}

export function HabitsClient({ items, date }: HabitsClientProps) {
  const [optimistic, dispatch] = useOptimistic(items as OptItem[], reducer)
  const [, startTransition]   = useTransition()
  const pendingRef             = useRef(new Set<string>())

  const today     = new Date().toISOString().slice(0, 10)
  const completed = optimistic.filter((i) => i.todayCompleted).length
  const total     = optimistic.length

  function handleToggle(habitId: string) {
    if (pendingRef.current.has(habitId)) return
    pendingRef.current.add(habitId)

    const fd = new FormData()
    fd.set('habit_id', habitId)
    fd.set('date', date)

    startTransition(async () => {
      dispatch({ type: 'toggle', habitId })
      const r = await toggleHabitLogAction(fd)
      pendingRef.current.delete(habitId)
      if ('error' in r) toast.error(r.error || 'Algo falló')
    })
  }

  if (total === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
        <span className="mb-3 text-3xl">🎯</span>
        <p className="font-medium">Sin hábitos activos</p>
        <p className="mt-1 text-sm text-muted">
          {date === today
            ? 'Crea tu primer hábito desde "Gestionar hábitos".'
            : 'No había hábitos activos este día.'}
        </p>
        {date === today ? (
          <Link
            href="/habits/manage"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98]"
          >
            <Target size={15} />
            Crear mi primer hÃ¡bito
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Day navigator */}
      <div className="flex items-center justify-between">
        <DayNavigator date={date} />
        {total > 0 && (
          <span className="text-xs text-muted">
            {completed}/{total} completados
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      {/* Habit list */}
      <div className="animate-fade-in space-y-2">
        {optimistic.map((item) => (
          <HabitCard
            key={item.habit.id}
            item={item}
            onToggle={handleToggle}
            isLoading={item.isPending}
          />
        ))}
      </div>

      {/* All done banner */}
      {total > 0 && completed === total && (
        <div className="rounded-xl bg-green-50 px-5 py-4 text-center dark:bg-green-950/30">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            ¡Todos los hábitos completados! 🎉
          </p>
        </div>
      )}
    </div>
  )
}
