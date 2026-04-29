'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import { GraduationCap, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createCVCourseAction, deleteCVCourseAction, updateCVCourseAction } from '@/app/(dashboard)/cv/actions'
import { CVCourseCard } from './CVCourseCard'
import { CVCourseForm, type CVCourseFormHandle } from './CVCourseForm'
import type { CVCourse } from '@/types/cv'

type OptimisticCourse = CVCourse & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add'; item: OptimisticCourse }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<CVCourse> }

function reducer(state: OptimisticCourse[], op: OptimisticOp): OptimisticCourse[] {
  switch (op.type) {
    case 'add':    return [op.item, ...state]
    case 'delete': return state.filter((item) => item.id !== op.id)
    case 'update': return state.map((item) => item.id === op.id ? { ...item, ...op.patch } : item)
    default:       return state
  }
}

export function CVCoursesClient({ items }: { items: CVCourse[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<CVCourseFormHandle>(null)

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimisticItem: OptimisticCourse = {
      id:                       `optimistic-${Date.now()}`,
      user_id:                  '',
      title:                    String(formData.get('title') ?? ''),
      provider:                 (formData.get('provider') as string) || null,
      credential_url:           (formData.get('credential_url') as string) || null,
      completed_at:             (formData.get('completed_at') as string) || null,
      description:              (formData.get('description') as string) || null,
      is_in_progress:           formData.get('is_in_progress') === 'true',
      expected_completion_date: (formData.get('expected_completion_date') as string) || null,
      order_index:              0,
      created_at:               now,
      isOptimistic:             true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticItem })
      const result = await createCVCourseAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Curso agregado')
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<CVCourse> = {
      title:          String(formData.get('title') ?? ''),
      provider:       (formData.get('provider') as string) || null,
      credential_url: (formData.get('credential_url') as string) || null,
      completed_at:   (formData.get('completed_at') as string) || null,
      description:    (formData.get('description') as string) || null,
    }
    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateCVCourseAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Curso actualizado')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteCVCourseAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Curso eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{optimistic.length} {optimistic.length === 1 ? 'curso' : 'cursos'}</p>
        <button onClick={() => formRef.current?.open(null)} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          <Plus size={16} /> Agregar
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <GraduationCap size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin cursos registrados todavia</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Agrega certificaciones, cursos o formacion corta para enriquecer tu CV.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((item) => (
            <CVCourseCard key={item.id} item={item} onEdit={(course) => formRef.current?.open(course)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CVCourseForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
