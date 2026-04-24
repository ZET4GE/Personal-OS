'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import type { Milestone } from '@/types/goals'
import { MilestoneItem } from './MilestoneItem'
import { createMilestoneAction } from '@/app/(dashboard)/goals/actions'

interface MilestoneListProps {
  goalId:     string
  milestones: Milestone[]
}

export function MilestoneList({ goalId, milestones }: MilestoneListProps) {
  const [adding, setAdding]     = useState(false)
  const [title, setTitle]       = useState('')
  const [isPending, start]      = useTransition()

  const completed = milestones.filter((m) => m.is_completed).length
  const total     = milestones.length

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const fd = new FormData()
    fd.set('goal_id',     goalId)
    fd.set('title',       title.trim())
    fd.set('order_index', String(total))
    start(async () => {
      await createMilestoneAction(fd)
      setTitle('')
      setAdding(false)
    })
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">
          Hitos
          {total > 0 && (
            <span className="ml-2 text-xs font-normal text-muted">
              {completed}/{total} completados
            </span>
          )}
        </h3>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Plus size={13} />
          Agregar
        </button>
      </div>

      {/* Items */}
      {milestones.length === 0 && !adding && (
        <p className="py-4 text-center text-sm text-muted">
          No hay hitos aún. ¡Agregá uno!
        </p>
      )}

      {milestones.map((m) => (
        <MilestoneItem key={m.id} milestone={m} />
      ))}

      {/* Add form */}
      {adding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 px-3 py-2">
          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            placeholder="Nuevo hito..."
            disabled={isPending}
            className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-50"
          >
            Agregar
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setTitle('') }}
            className="rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-hover"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  )
}
