'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  togglePublicAction,
} from '@/app/(dashboard)/projects/actions'
import { ProjectCard } from './ProjectCard'
import { ProjectForm, type ProjectFormHandle } from './ProjectForm'
import type { Project } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Optimistic state
// ─────────────────────────────────────────────────────────────

type OptimisticProject = Project & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    project: OptimisticProject }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<Project> }
  | { type: 'toggle'; id: string; is_public: boolean }

function optimisticReducer(state: OptimisticProject[], op: OptimisticOp): OptimisticProject[] {
  switch (op.type) {
    case 'add':    return [op.project, ...state]
    case 'delete': return state.filter((p) => p.id !== op.id)
    case 'update': return state.map((p) => (p.id === op.id ? { ...p, ...op.patch } : p))
    case 'toggle': return state.map((p) => (p.id === op.id ? { ...p, is_public: op.is_public } : p))
    default:       return state
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const [optimisticProjects, dispatch] = useOptimistic(projects, optimisticReducer)
  const [isPending, startTransition]   = useTransition()
  const formRef                        = useRef<ProjectFormHandle>(null)

  function openCreate()               { formRef.current?.open(null) }
  function openEdit(p: Project)       { formRef.current?.open(p) }

  function formDataToProjectPatch(fd: FormData): Partial<Project> {
    const techRaw = fd.get('tech_stack') as string | null
    return {
      title:       (fd.get('title') as string) || undefined,
      description: (fd.get('description') as string) || null,
      status:      (fd.get('status') as Project['status']) || undefined,
      is_public:   fd.get('is_public') === 'true',
      tech_stack:  techRaw ? techRaw.split(',').map((t) => t.trim()).filter(Boolean) : [],
      github_url:  (fd.get('github_url') as string) || null,
      live_url:    (fd.get('live_url') as string) || null,
    }
  }

  function handleCreate(formData: FormData) {
    const now   = new Date().toISOString()
    const patch = formDataToProjectPatch(formData)
    const optimistic: OptimisticProject = {
      id: `optimistic-${Date.now()}`, user_id: '',
      title: patch.title ?? '', description: patch.description ?? null,
      tech_stack: patch.tech_stack ?? [], status: patch.status ?? 'in_progress',
      is_public: patch.is_public ?? false, github_url: patch.github_url ?? null,
      live_url: patch.live_url ?? null, image_url: null,
      created_at: now, updated_at: now, isOptimistic: true,
    }

    startTransition(async () => {
      dispatch({ type: 'add', project: optimistic })
      const result = await createProjectAction(formData)
      if (result.error) toast.error(result.error || 'Algo falló')
      else              toast.success('Proyecto creado')
    })
  }

  function handleUpdate(formData: FormData) {
    const id    = String(formData.get('id') ?? '')
    const patch = formDataToProjectPatch(formData)

    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateProjectAction(formData)
      if (result.error) toast.error(result.error || 'Algo falló')
      else              toast.success('Proyecto actualizado')
    })
  }

  function handleTogglePublic(formData: FormData) {
    const id        = String(formData.get('id') ?? '')
    const is_public = formData.get('is_public') === 'true'

    startTransition(async () => {
      dispatch({ type: 'toggle', id, is_public })
      const result = await togglePublicAction(formData)
      if (result.error) toast.error(result.error || 'Algo falló')
      else              toast.success(is_public ? 'Proyecto publicado' : 'Proyecto ocultado')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')

    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteProjectAction(formData)
      if (result.error) toast.error(result.error || 'Algo falló')
      else              toast.success('Proyecto eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {optimisticProjects.length}{' '}
          {optimisticProjects.length === 1 ? 'proyecto' : 'proyectos'}
        </p>
        <button
          onClick={openCreate}
          aria-label="Nuevo proyecto"
          disabled={isPending}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          {isPending ? 'Guardando...' : 'Nuevo proyecto'}
        </button>
      </div>

      {optimisticProjects.length === 0 ? (
        <div className="animate-fade-in flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FolderOpen size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin proyectos todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Crea tu primer proyecto. Los que marques como{' '}
            <span className="font-medium text-green-600">Público</span> aparecerán en tu portafolio.
          </p>
          <button
            onClick={openCreate}
            disabled={isPending}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={15} />
            Crear mi primer proyecto
          </button>
        </div>
      ) : (
        <div className="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {optimisticProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDelete={handleDelete}
              onTogglePublic={handleTogglePublic}
            />
          ))}
        </div>
      )}

      <ProjectForm
        ref={formRef}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}
