'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  createHabitAction,
  updateHabitAction,
  deleteHabitAction,
  setHabitActiveAction,
} from '@/app/(dashboard)/habits/actions'
import { HabitForm, type HabitFormHandle } from './HabitForm'
import { HABIT_COLOR_STYLES, FREQUENCY_LABELS } from '@/types/habits'
import type { Habit } from '@/types/habits'

type OptHabit = Habit & { isOptimistic?: boolean }

function reducer(
  state: OptHabit[],
  op:
    | { type: 'add';    habit: OptHabit }
    | { type: 'update'; id: string; patch: Partial<Habit> }
    | { type: 'delete'; id: string },
): OptHabit[] {
  if (op.type === 'add')    return [op.habit, ...state]
  if (op.type === 'delete') return state.filter((h) => h.id !== op.id)
  if (op.type === 'update') return state.map((h) => h.id === op.id ? { ...h, ...op.patch } : h)
  return state
}

interface ManageHabitsClientProps {
  habits: Habit[]
}

export function ManageHabitsClient({ habits }: ManageHabitsClientProps) {
  const [optimistic, dispatch] = useOptimistic(habits as OptHabit[], reducer)
  const [, startTransition]   = useTransition()
  const formRef               = useRef<HabitFormHandle>(null)

  function openCreate() { formRef.current?.open(null) }
  function openEdit(h: Habit) { formRef.current?.open(h) }

  function handleCreate(fd: FormData) {
    const now = new Date().toISOString()
    const opt: OptHabit = {
      id: `opt-${Date.now()}`, user_id: '',
      name: String(fd.get('name') ?? ''),
      description: null, icon: String(fd.get('icon') ?? '') || null,
      color: (fd.get('color') as Habit['color']) ?? 'blue',
      frequency: (fd.get('frequency') as Habit['frequency']) ?? 'daily',
      target_days: [1, 2, 3, 4, 5, 6, 0],
      reminder_time: null, is_active: true, order_index: 0, created_at: now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', habit: opt })
      const r = await createHabitAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Hábito creado')
    })
  }

  function handleUpdate(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'update', id, patch: { name: String(fd.get('name') ?? '') } })
      const r = await updateHabitAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Hábito actualizado')
    })
  }

  function handleToggleActive(h: Habit) {
    const fd = new FormData()
    fd.set('id', h.id)
    fd.set('is_active', String(!h.is_active))
    startTransition(async () => {
      dispatch({ type: 'update', id: h.id, patch: { is_active: !h.is_active } })
      const r = await setHabitActiveAction(fd)
      if ('error' in r) toast.error(r.error)
    })
  }

  function handleDelete(h: Habit) {
    if (!confirm(`¿Eliminar "${h.name}" y todos sus registros?`)) return
    const fd = new FormData()
    fd.set('id', h.id)
    startTransition(async () => {
      dispatch({ type: 'delete', id: h.id })
      const r = await deleteHabitAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Hábito eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} /> Nuevo hábito
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <span className="mb-3 text-3xl">🎯</span>
          <p className="font-medium">Sin hábitos todavía</p>
          <p className="mt-1 text-sm text-muted">Crea tu primer hábito con el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {optimistic.map((h) => {
            const styles = HABIT_COLOR_STYLES[h.color]
            return (
              <div
                key={h.id}
                className={[
                  'flex items-center gap-4 rounded-xl border bg-surface p-4 transition-opacity',
                  h.is_active ? 'border-border' : 'border-border opacity-50',
                ].join(' ')}
              >
                {/* Color dot */}
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.bg}`} />

                {/* Info */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    {h.icon && <span>{h.icon}</span>}
                    <span className="text-sm font-semibold truncate">{h.name}</span>
                  </div>
                  <span className="text-xs text-muted">{FREQUENCY_LABELS[h.frequency]}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(h)}
                    title={h.is_active ? 'Desactivar' : 'Activar'}
                    className="rounded-lg p-2 text-muted transition-colors hover:text-foreground"
                  >
                    {h.is_active
                      ? <ToggleRight size={18} className="text-green-600" />
                      : <ToggleLeft  size={18} />
                    }
                  </button>
                  <button
                    onClick={() => openEdit(h)}
                    className="rounded-lg p-2 text-muted transition-colors hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(h)}
                    className="rounded-lg p-2 text-muted transition-colors hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <HabitForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
