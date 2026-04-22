'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, ChevronLeft, Clock, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import {
  toggleRoutineItemAction,
  completeRoutineAction,
} from '@/app/(dashboard)/routines/actions'
import type { Routine, RoutineItem, RoutineLog } from '@/types/habits'

interface RoutineRunnerProps {
  routine: Routine
  items:   RoutineItem[]
  log:     RoutineLog | null
  date:    string   // 'YYYY-MM-DD'
}

export function RoutineRunner({ routine, items, log, date }: RoutineRunnerProps) {
  const router = useRouter()
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(log?.completed_items ?? []),
  )
  const [isPending, startTransition] = useTransition()
  const [isSaving,  setIsSaving]     = useState(false)

  const completedCount = completedIds.size
  const totalItems     = items.length
  const allDone        = totalItems > 0 && completedCount === totalItems
  const progressPct    = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
  const isFinished     = !!log?.finished_at

  function handleToggle(itemId: string) {
    if (isFinished) return

    // Optimistic local update
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })

    const fd = new FormData()
    fd.set('routine_id', routine.id)
    fd.set('item_id',    itemId)
    fd.set('date',       date)

    startTransition(async () => {
      const r = await toggleRoutineItemAction(fd)
      if ('error' in r) {
        // Revert on error
        setCompletedIds((prev) => {
          const next = new Set(prev)
          if (next.has(itemId)) next.delete(itemId)
          else next.add(itemId)
          return next
        })
        toast.error(r.error)
      }
    })
  }

  async function handleComplete() {
    setIsSaving(true)
    const fd = new FormData()
    fd.set('routine_id',      routine.id)
    fd.set('date',            date)
    fd.set('completed_items', [...completedIds].join(','))

    const r = await completeRoutineAction(fd)
    setIsSaving(false)

    if ('error' in r) {
      toast.error(r.error)
    } else {
      toast.success('¡Rutina completada! 🎉')
      router.push('/routines')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push('/routines')}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ChevronLeft size={16} /> Rutinas
      </button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{routine.name}</h2>
            {routine.description && (
              <p className="mt-1 text-sm text-muted">{routine.description}</p>
            )}
          </div>
          {isFinished && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <Trophy size={12} /> Completada
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          {routine.estimated_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {routine.estimated_minutes} min
            </span>
          )}
          <span>{completedCount}/{totalItems} items</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface py-10 text-center text-sm text-muted">
          Esta rutina no tiene items todavía.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const done = completedIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                disabled={isFinished || isPending}
                className={[
                  'flex w-full items-center gap-4 rounded-xl border bg-surface p-4 text-left transition-all',
                  done
                    ? 'border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/20'
                    : 'border-border hover:border-accent-400',
                  isFinished || isPending ? 'cursor-default' : 'cursor-pointer',
                ].join(' ')}
              >
                {done
                  ? <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                  : <Circle       size={20} className="shrink-0 text-muted" />
                }
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className={`text-sm font-medium ${done ? 'line-through text-muted' : ''}`}>
                    {item.title}
                  </span>
                  {item.duration_minutes && (
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={10} /> {item.duration_minutes} min
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Complete button */}
      {!isFinished && (
        <button
          onClick={handleComplete}
          disabled={isSaving || isPending}
          className={[
            'w-full rounded-xl py-3 text-sm font-semibold transition-all',
            allDone
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'border border-border bg-surface text-muted hover:text-foreground',
            isSaving ? 'opacity-60' : '',
          ].join(' ')}
        >
          {isSaving
            ? 'Guardando...'
            : allDone
              ? '¡Completar rutina! 🎉'
              : `Marcar como completada (${completedCount}/${totalItems})`
          }
        </button>
      )}

      {isFinished && (
        <div className="rounded-xl bg-green-50 px-5 py-4 text-center dark:bg-green-950/30">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">
            Rutina completada hoy 🏆
          </p>
        </div>
      )}
    </div>
  )
}
