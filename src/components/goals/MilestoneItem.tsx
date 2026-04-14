'use client'

import { useTransition } from 'react'
import { Trash2, CalendarDays } from 'lucide-react'
import type { Milestone } from '@/types/goals'
import { toggleMilestoneAction, deleteMilestoneAction } from '@/app/(dashboard)/goals/actions'

interface MilestoneItemProps {
  milestone: Milestone
}

export function MilestoneItem({ milestone }: MilestoneItemProps) {
  const [isToggling, startToggle] = useTransition()
  const [isDeleting, startDelete] = useTransition()

  function handleToggle() {
    const fd = new FormData()
    fd.set('id', milestone.id)
    startToggle(async () => { await toggleMilestoneAction(fd) })
  }

  function handleDelete() {
    const fd = new FormData()
    fd.set('id', milestone.id)
    startDelete(async () => { await deleteMilestoneAction(fd) })
  }

  const isPending = isToggling || isDeleting

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover ${isPending ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={milestone.is_completed ? 'Marcar como pendiente' : 'Marcar como completado'}
        className="shrink-0"
      >
        <div
          className={[
            'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            milestone.is_completed
              ? 'border-emerald-500 bg-emerald-500'
              : 'border-border hover:border-emerald-400',
          ].join(' ')}
        >
          {milestone.is_completed && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-colors ${
            milestone.is_completed ? 'text-muted line-through' : 'text-text'
          }`}
        >
          {milestone.title}
        </p>
        {milestone.target_date && (
          <p className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
            <CalendarDays size={11} />
            {new Date(milestone.target_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Eliminar hito"
        className="shrink-0 rounded p-1 text-transparent transition-colors group-hover:text-muted hover:!text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
