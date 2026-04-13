'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { createEducationAction, updateEducationAction, deleteEducationAction } from '@/app/(dashboard)/cv/actions'
import { EducationCard } from './EducationCard'
import { EducationForm, type EducationFormHandle } from './EducationForm'
import type { Education } from '@/types/cv'

type OptimisticEdu = Education & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    item: OptimisticEdu }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<Education> }

function reducer(state: OptimisticEdu[], op: OptimisticOp): OptimisticEdu[] {
  switch (op.type) {
    case 'add':    return [op.item, ...state]
    case 'delete': return state.filter((i) => i.id !== op.id)
    case 'update': return state.map((i) => i.id === op.id ? { ...i, ...op.patch } : i)
    default:       return state
  }
}

export function EducationClient({ items }: { items: Education[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<EducationFormHandle>(null)

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimisticItem: OptimisticEdu = {
      id:          `optimistic-${Date.now()}`,
      user_id:     '',
      institution: String(formData.get('institution') ?? ''),
      degree:      String(formData.get('degree') ?? ''),
      field:       (formData.get('field') as string) || null,
      start_date:  (formData.get('start_date') as string) || null,
      end_date:    (formData.get('end_date') as string) || null,
      description: (formData.get('description') as string) || null,
      order_index: 0,
      created_at:  now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticItem })
      const result = await createEducationAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Educación agregada')
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<Education> = {
      institution: String(formData.get('institution') ?? ''),
      degree:      String(formData.get('degree') ?? ''),
      field:       (formData.get('field') as string) || null,
      start_date:  (formData.get('start_date') as string) || null,
      end_date:    (formData.get('end_date') as string) || null,
      description: (formData.get('description') as string) || null,
    }
    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateEducationAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Educación actualizada')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteEducationAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Educación eliminada')
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
            <GraduationCap size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin educación registrada todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Agrega tu formación académica con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((item) => (
            <EducationCard
              key={item.id}
              item={item}
              onEdit={(i) => formRef.current?.open(i)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EducationForm
        ref={formRef}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}
