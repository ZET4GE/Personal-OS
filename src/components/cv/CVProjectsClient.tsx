'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import { FolderGit2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createCVProjectAction, deleteCVProjectAction, updateCVProjectAction } from '@/app/(dashboard)/cv/actions'
import { CVProjectCard } from './CVProjectCard'
import { CVProjectForm, type CVProjectFormHandle } from './CVProjectForm'
import type { CVProject } from '@/types/cv'

type OptimisticProject = CVProject & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add'; item: OptimisticProject }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<CVProject> }

function reducer(state: OptimisticProject[], op: OptimisticOp): OptimisticProject[] {
  switch (op.type) {
    case 'add':    return [op.item, ...state]
    case 'delete': return state.filter((item) => item.id !== op.id)
    case 'update': return state.map((item) => item.id === op.id ? { ...item, ...op.patch } : item)
    default:       return state
  }
}

function parseTechStack(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function CVProjectsClient({ items }: { items: CVProject[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<CVProjectFormHandle>(null)

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimisticItem: OptimisticProject = {
      id:          `optimistic-${Date.now()}`,
      user_id:     '',
      title:       String(formData.get('title') ?? ''),
      description: (formData.get('description') as string) || null,
      url:         (formData.get('url') as string) || null,
      repo_url:    (formData.get('repo_url') as string) || null,
      tech_stack:  parseTechStack(formData.get('tech_stack')),
      is_featured: formData.get('is_featured') === 'true',
      order_index: 0,
      created_at:  now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticItem })
      const result = await createCVProjectAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Proyecto agregado')
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<CVProject> = {
      title:       String(formData.get('title') ?? ''),
      description: (formData.get('description') as string) || null,
      url:         (formData.get('url') as string) || null,
      repo_url:    (formData.get('repo_url') as string) || null,
      tech_stack:  parseTechStack(formData.get('tech_stack')),
      is_featured: formData.get('is_featured') === 'true',
    }
    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateCVProjectAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Proyecto actualizado')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteCVProjectAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Proyecto eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{optimistic.length} {optimistic.length === 1 ? 'proyecto' : 'proyectos'}</p>
        <button onClick={() => formRef.current?.open(null)} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          <Plus size={16} /> Agregar
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FolderGit2 size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin proyectos para CV todavia</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Agrega proyectos personales o destacados que quieras mostrar aunque no esten en el modulo de proyectos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((item) => (
            <CVProjectCard key={item.id} item={item} onEdit={(project) => formRef.current?.open(project)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CVProjectForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
