'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import type { TodayHabitsSummary } from '@/types/dashboard'
import { HABIT_COLOR_STYLES } from '@/types/habits'
import { toggleHabitLogAction } from '@/app/(dashboard)/habits/actions'
import { toast } from 'sonner'

export function TodayHabits({ data, todayStr }: { data: TodayHabitsSummary; todayStr: string }) {
  const [optimisticState, setOptimisticState] = useState(() => 
    data.habits.map(h => ({
      id: h.habit.id,
      completed: h.todayCompleted
    }))
  )
  const [isPending, startTransition] = useTransition()

  // Find habits due today. `isDue` for today can be found in `recentDays` where `date === todayStr`.
  const dueHabits = data.habits.filter(h => {
    const todayLog = h.recentDays.find(d => d.date === todayStr)
    return todayLog ? todayLog.isDue : false
  })

  const completedCount = optimisticState.filter(
    s => s.completed && dueHabits.some(h => h.habit.id === s.id)
  ).length

  const progress = dueHabits.length > 0 ? (completedCount / dueHabits.length) * 100 : 0

  function handleToggle(habitId: string, currentCompleted: boolean) {
    // Optimistic update
    setOptimisticState(prev => prev.map(s => s.id === habitId ? { ...s, completed: !currentCompleted } : s))

    startTransition(async () => {
      const fd = new FormData()
      fd.append('habit_id', habitId)
      fd.append('date', todayStr)
      const res = await toggleHabitLogAction(fd)
      
      if ('error' in res) {
        toast.error(res.error)
        // Revert
        setOptimisticState(prev => prev.map(s => s.id === habitId ? { ...s, completed: currentCompleted } : s))
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Hábitos de Hoy</h3>
        <Link href="/habits" className="text-xs text-muted transition-colors hover:text-text">
          Ver todos <ArrowRight size={12} className="inline" />
        </Link>
      </div>

      {dueHabits.length > 0 ? (
        <>
          <div className="mb-2">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted">Progreso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div 
                className="h-full bg-accent-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {dueHabits.map((h) => {
              const opt = optimisticState.find(s => s.id === h.habit.id)
              const isCompleted = opt ? opt.completed : h.todayCompleted
              const colorStyle = HABIT_COLOR_STYLES[h.habit.color]

              return (
                <button
                  key={h.habit.id}
                  onClick={() => handleToggle(h.habit.id, isCompleted)}
                  disabled={isPending}
                  className="group flex items-center justify-between rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:border-border-bright text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{h.habit.icon || '📌'}</span>
                    <span className={`text-sm font-medium ${isCompleted ? 'text-muted line-through' : 'text-text'}`}>
                      {h.habit.name}
                    </span>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                      isCompleted
                        ? `${colorStyle.bg} border-transparent text-white`
                        : 'border-border bg-surface group-hover:border-border-bright'
                    }`}
                  >
                    {isCompleted && <Check size={14} />}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-muted">No hay hábitos programados para hoy</p>
          <Link href="/habits/manage" className="mt-2 text-xs text-accent-500 hover:underline">
            Creá tu primer hábito
          </Link>
        </div>
      )}
    </div>
  )
}