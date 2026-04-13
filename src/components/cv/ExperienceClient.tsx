'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { createWorkExperienceAction, updateWorkExperienceAction, deleteWorkExperienceAction } from '@/app/(dashboard)/cv/actions'
import { ExperienceCard } from './ExperienceCard'
import { ExperienceForm, type ExperienceFormHandle } from './ExperienceForm'
import type { WorkExperience } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Optimistic state
// ─────────────────────────────────────────────────────────────

type OptimisticExp = WorkExperience & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    item: OptimisticExp }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<WorkExperience> }

function reducer(state: OptimisticExp[], op: OptimisticOp): OptimisticExp[] {
  switch (op.type) {
    case 'add':    return [op.item, ...state]
    case 'delete': return state.filter((i) => i.id !== op.id)
    case 'update': return state.map((i) => i.id === op.id ? { ...i, ...op.patch } : i)
    default:       return state
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ExperienceClient({ items }: { items: WorkExperience[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<ExperienceFormHandle>(null)

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimisticItem: OptimisticExp = {
      id:          `optimistic-${Date.now()}`,
      user_id:     '',
      company:     String(formData.get('company') ?? ''),
      role:        String(formData.get('role') ?? ''),
      description: (formData.get('description') as string) || null,
      start_date:  String(formData.get('start_date') ?? ''),
      end_date:    (formData.get('end_date') as string) || null,
      is_current:  formData.get('is_current') === 'true',
      location:    (formData.get('location') as string) || null,
      order_index: 0,
      created_at:  now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticItem })
      const result = await createWorkExperienceAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Experiencia creada')
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<WorkExperience> = {
      company:     String(formData.get('company') ?? ''),
      role:        String(formData.get('role') ?? ''),
      description: (formData.get('description') as string) || null,
      start_date:  String(formData.get('start_date') ?? ''),
      end_date:    (formData.get('end_date') as string) || null,
      is_current:  formData.get('is_current') === 'true',
      location:    (formData.get('location') as string) || null,
    }
    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateWorkExperienceAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Experiencia actualizada')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteWorkExperienceAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Experiencia eliminada')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {optimistic.length} {optimistic.length === 1 ? 'entrada' : 'entradas'}
        </p>
        <button
          onClick={() => formRef.current?.open(null)}
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Briefcase size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin experiencia laboral todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Agrega tu primera experiencia con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((item) => (
            <ExperienceCard
              key={item.id}
              item={item}
              onEdit={(i) => formRef.current?.open(i)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ExperienceForm
        ref={formRef}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}
