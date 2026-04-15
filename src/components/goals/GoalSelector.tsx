'use client'

import { useState } from 'react'
import { Link2, Loader2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useUserGoals } from '@/hooks/useUserGoals'
import { linkEntityToGoal } from '@/services/goal-links'
import type { GoalLinkEntityType } from '@/services/goal-links'

interface GoalSelectorProps {
  entityId: string
  entityType: GoalLinkEntityType
  className?: string
  align?: 'left' | 'right'
}

export function GoalSelector({
  entityId,
  entityType,
  className = '',
  align = 'right',
}: GoalSelectorProps) {
  const { goals, loading, error } = useUserGoals()
  const [open, setOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLink() {
    if (!selectedGoalId) {
      toast.error('Selecciona una meta')
      return
    }

    setIsSubmitting(true)
    const result = await linkEntityToGoal(selectedGoalId, entityType, entityId)
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Entidad vinculada a la meta')
    setOpen(false)
    setSelectedGoalId('')
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <Target size={13} />
        Vincular a meta
      </button>

      {open && (
        <div
          className={[
            'absolute z-30 mt-2 w-64 rounded-xl border border-border bg-surface p-3 shadow-lg',
            align === 'left' ? 'left-0' : 'right-0',
          ].join(' ')}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2 size={14} />
            Vincular a meta
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 size={13} className="animate-spin" />
              Cargando metas...
            </div>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : goals.length === 0 ? (
            <p className="text-xs text-muted">No tienes metas creadas.</p>
          ) : (
            <>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent-600"
              >
                <option value="">Selecciona una meta</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleLink}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Vincular
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
