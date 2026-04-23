'use client'

import { useOptimistic, useTransition, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createRoutineAction,
  updateRoutineAction,
  deleteRoutineAction,
} from '@/app/(dashboard)/routines/actions'
import { RoutineCard } from './RoutineCard'
import { RoutineForm, type RoutineFormHandle } from './RoutineForm'
import { RoutineStatsView } from './RoutineStatsView'
import type { RoutineWithStatus, Routine } from '@/types/habits'
import type { RoutineStats } from '@/services/routines'

type OptRoutine = RoutineWithStatus & { isOptimistic?: boolean }

function reducer(
  state: OptRoutine[],
  op:
    | { type: 'add';    item: OptRoutine }
    | { type: 'update'; id: string; patch: Partial<Routine> }
    | { type: 'delete'; id: string },
): OptRoutine[] {
  if (op.type === 'add')    return [op.item, ...state]
  if (op.type === 'delete') return state.filter((r) => r.routine.id !== op.id)
  if (op.type === 'update') return state.map((r) =>
    r.routine.id === op.id ? { ...r, routine: { ...r.routine, ...op.patch } } : r,
  )
  return state
}

interface RoutinesClientProps {
  routines: RoutineWithStatus[]
  stats:    RoutineStats[]
  date:     string  // 'YYYY-MM-DD'
}

export function RoutinesClient({ routines, stats, date }: RoutinesClientProps) {
  const [optimistic, dispatch] = useOptimistic(routines as OptRoutine[], reducer)
  const [, startTransition]   = useTransition()
  const formRef               = useRef<RoutineFormHandle>(null)
  const [view, setView]       = useState<'today' | 'stats'>('today')

  const completed = optimistic.filter((r) => r.isCompleted).length
  const total     = optimistic.length

  function openCreate() { formRef.current?.open(null) }
  function openEdit(r: Routine) { formRef.current?.open(r) }

  function handleCreate(fd: FormData) {
    const now = new Date().toISOString()
    const opt: OptRoutine = {
      routine: {
        id: `opt-${Date.now()}`, user_id: '',
        name: String(fd.get('name') ?? ''),
        description: null,
        time_of_day: (fd.get('time_of_day') as Routine['time_of_day']) ?? 'morning',
        estimated_minutes: null, is_active: true, order_index: 0, created_at: now,
      },
      items: [], log: null, completedCount: 0, totalItems: 0, isCompleted: false,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: opt })
      const r = await createRoutineAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Rutina creada')
    })
  }

  function handleUpdate(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'update', id, patch: { name: String(fd.get('name') ?? '') } })
      const r = await updateRoutineAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Rutina actualizada')
    })
  }

  function handleDelete(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const r = await deleteRoutineAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Rutina eliminada')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
          {(['today', 'stats'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={[
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                view === v ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text',
              ].join(' ')}
            >
              {v === 'today' ? 'Hoy' : 'Estadísticas'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {view === 'today' && total > 0 && (
            <p className="text-sm text-muted">{completed}/{total} completadas</p>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={15} /> Nueva rutina
          </button>
        </div>
      </div>

      {view === 'stats' ? (
        <RoutineStatsView stats={stats} />
      ) : optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <span className="mb-3 text-3xl">📋</span>
          <p className="font-medium">Sin rutinas todavía</p>
          <p className="mt-1 text-sm text-muted">
            Crea tu primera rutina para organizar tu día.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((item) => (
            <RoutineCard
              key={item.routine.id}
              item={item}
              date={date}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RoutineForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
