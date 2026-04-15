import Link from 'next/link'
import { ChevronRight, Pencil, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react'
import { TIME_OF_DAY_EMOJI, TIME_OF_DAY_LABELS } from '@/types/habits'
import type { RoutineWithStatus, Routine } from '@/types/habits'
import { GoalSelector } from '@/components/goals/GoalSelector'

interface RoutineCardProps {
  item:     RoutineWithStatus
  date:     string
  onEdit:   (r: Routine) => void
  onDelete: (fd: FormData) => void
}

export function RoutineCard({ item, date, onEdit, onDelete }: RoutineCardProps) {
  const { routine, items, completedCount, totalItems, isCompleted } = item

  function handleDelete() {
    if (!confirm(`¿Eliminar "${routine.name}" y todos sus registros?`)) return
    const fd = new FormData()
    fd.set('id', routine.id)
    onDelete(fd)
  }

  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <div className={[
      'rounded-xl border bg-surface transition-all',
      isCompleted
        ? 'border-green-200 dark:border-green-900/40'
        : 'border-border',
    ].join(' ')}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <span className="text-lg">{TIME_OF_DAY_EMOJI[routine.time_of_day]}</span>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{routine.name}</span>
            {isCompleted && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                Completada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{TIME_OF_DAY_LABELS[routine.time_of_day]}</span>
            {routine.estimated_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> {routine.estimated_minutes} min
              </span>
            )}
            <span>{completedCount}/{totalItems} items</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <GoalSelector entityId={routine.id} entityType="routine" />
          <button onClick={() => onEdit(routine)} className="rounded-lg p-1.5 text-muted hover:text-foreground transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={handleDelete} className="rounded-lg p-1.5 text-muted hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
          <Link
            href={`/routines/${routine.id}?date=${date}`}
            className="ml-1 flex items-center gap-1 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            {isCompleted ? 'Ver' : 'Iniciar'} <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="px-4 pb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {/* Items preview */}
          <ul className="mt-3 space-y-1">
            {items.slice(0, 3).map((itm) => {
              const done = item.log?.completed_items.includes(itm.id) ?? false
              return (
                <li key={itm.id} className="flex items-center gap-2 text-xs text-muted">
                  {done
                    ? <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    : <Circle      size={12} className="shrink-0" />
                  }
                  <span className={done ? 'line-through' : ''}>{itm.title}</span>
                  {itm.duration_minutes && (
                    <span className="ml-auto shrink-0">{itm.duration_minutes}m</span>
                  )}
                </li>
              )
            })}
            {items.length > 3 && (
              <li className="text-xs text-muted pl-5">+{items.length - 3} más...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
