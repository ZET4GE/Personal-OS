'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { GoalUpdate, Milestone } from '@/types/goals'
import { MOOD_META } from '@/types/goals'
import { deleteGoalUpdateAction } from '@/app/(dashboard)/goals/actions'

type TimelineItem =
  | { type: 'update'; data: GoalUpdate; date: string }
  | { type: 'milestone'; data: Milestone; date: string }

function UpdateItem({ update }: { update: GoalUpdate }) {
  const [isPending, start] = useTransition()
  const mood = update.mood ? MOOD_META[update.mood] : null

  function handleDelete() {
    const fd = new FormData()
    fd.set('id', update.id)
    start(async () => { await deleteGoalUpdateAction(fd) })
  }

  return (
    <div className={`group flex gap-3 ${isPending ? 'opacity-60' : ''}`}>
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-600/10 text-base">
          {mood?.emoji ?? '📝'}
        </div>
        <div className="mt-1 flex-1 w-px bg-border" />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs text-muted">
            {new Date(update.created_at).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
            {mood && <span className="ml-2 font-medium text-foreground">{mood.label}</span>}
          </span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="shrink-0 rounded p-1 text-transparent transition-colors group-hover:text-muted hover:!text-red-500"
          >
            <Trash2 size={13} />
          </button>
        </div>
        <p className="text-sm text-text leading-relaxed">{update.content}</p>
      </div>
    </div>
  )
}

function MilestoneCompletedItem({ milestone }: { milestone: Milestone }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-base">
          ✅
        </div>
        <div className="mt-1 flex-1 w-px bg-border" />
      </div>
      <div className="flex-1 pb-4 min-w-0">
        <p className="text-xs text-muted mb-1">
          {milestone.completed_at
            ? new Date(milestone.completed_at).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : ''}
        </p>
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Hito completado: {milestone.title}
        </p>
      </div>
    </div>
  )
}

interface GoalTimelineProps {
  updates:    GoalUpdate[]
  milestones: Milestone[]
}

export function GoalTimeline({ updates, milestones }: GoalTimelineProps) {
  const completedMilestones = milestones.filter((m) => m.is_completed && m.completed_at)

  const items: TimelineItem[] = [
    ...updates.map((u)          => ({ type: 'update'    as const, data: u, date: u.created_at })),
    ...completedMilestones.map((m) => ({ type: 'milestone' as const, data: m, date: m.completed_at! })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Aún no hay actualizaciones. ¡Registrá tu primer progreso!
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={`${item.type}-${item.data.id}`} className={isLast ? '[&_.flex-1.w-px]:hidden' : ''}>
            {item.type === 'update'
              ? <UpdateItem update={item.data as GoalUpdate} />
              : <MilestoneCompletedItem milestone={item.data as Milestone} />
            }
          </div>
        )
      })}
    </div>
  )
}
