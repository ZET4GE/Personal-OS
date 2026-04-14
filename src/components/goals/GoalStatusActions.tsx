'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PauseCircle, PlayCircle, XCircle, CheckCircle2, Trash2 } from 'lucide-react'
import type { Goal } from '@/types/goals'
import { toggleGoalStatusAction, deleteGoalAction } from '@/app/(dashboard)/goals/actions'

interface GoalStatusActionsProps {
  goal: Goal
}

export function GoalStatusActions({ goal }: GoalStatusActionsProps) {
  const [isPending, start] = useTransition()
  const router = useRouter()

  function handleStatus(status: string) {
    const fd = new FormData()
    fd.set('id', goal.id)
    fd.set('status', status)
    start(async () => { await toggleGoalStatusAction(fd) })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar esta meta? Esta acción no se puede deshacer.')) return
    const fd = new FormData()
    fd.set('id', goal.id)
    start(async () => {
      await deleteGoalAction(fd)
      router.push('/goals')
    })
  }

  return (
    <div className={`flex flex-wrap gap-2 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {goal.status === 'active' && (
        <>
          <button
            onClick={() => handleStatus('completed')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            <CheckCircle2 size={13} />
            Completar
          </button>
          <button
            onClick={() => handleStatus('paused')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <PauseCircle size={13} />
            Pausar
          </button>
          <button
            onClick={() => handleStatus('abandoned')}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/20"
          >
            <XCircle size={13} />
            Abandonar
          </button>
        </>
      )}

      {(goal.status === 'paused' || goal.status === 'abandoned') && (
        <button
          onClick={() => handleStatus('active')}
          className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-500/20"
        >
          <PlayCircle size={13} />
          Reactivar
        </button>
      )}

      <button
        onClick={handleDelete}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 ml-auto"
      >
        <Trash2 size={13} />
        Eliminar
      </button>
    </div>
  )
}
