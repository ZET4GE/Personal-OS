'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import {
  createProjectAction,
  updateProjectAction,
  updateProjectStatusAction,
  deleteProjectAction,
} from '@/app/(dashboard)/freelance/actions'
import { ClientProjectCard } from './ClientProjectCard'
import { ClientProjectForm, type ClientProjectFormHandle } from './ClientProjectForm'
import type { ClientProject, Client, ProjectStatusClient } from '@/types/clients'

type OptProject = ClientProject & { isOptimistic?: boolean }

type Op =
  | { type: 'add';    p: OptProject }
  | { type: 'delete'; id: string }
  | { type: 'status'; id: string; status: ProjectStatusClient }
  | { type: 'update'; id: string; patch: Partial<ClientProject> }

function reducer(state: OptProject[], op: Op): OptProject[] {
  switch (op.type) {
    case 'add':    return [op.p, ...state]
    case 'delete': return state.filter((p) => p.id !== op.id)
    case 'status': return state.map((p) => p.id === op.id ? { ...p, status: op.status } : p)
    case 'update': return state.map((p) => p.id === op.id ? { ...p, ...op.patch } : p)
    default:       return state
  }
}

interface FreelanceClientProps {
  projects: ClientProject[]
  clients:  Client[]
}

export function FreelanceClient({ projects, clients }: FreelanceClientProps) {
  const [optimistic, dispatch] = useOptimistic(projects, reducer)
  const [, startTransition]    = useTransition()
  const formRef                = useRef<ClientProjectFormHandle>(null)

  function openCreate() { formRef.current?.open(null) }
  function openEdit(p: ClientProject) { formRef.current?.open(p) }

  function handleCreate(fd: FormData) {
    const now = new Date().toISOString()
    const clientId = fd.get('client_id') as string | null
    const client   = clients.find((c) => c.id === clientId) ?? null
    const opt: OptProject = {
      id: `opt-${Date.now()}`, user_id: '',
      client_id: clientId || null,
      title: String(fd.get('title') ?? ''),
      description: null,
      status: (fd.get('status') as ProjectStatusClient) ?? 'proposal',
      priority: (fd.get('priority') as 'low' | 'medium' | 'high') ?? 'medium',
      budget: fd.get('budget') ? parseFloat(fd.get('budget') as string) : null,
      currency: (fd.get('currency') as 'ARS' | 'USD' | 'EUR') ?? 'ARS',
      paid_amount: 0,
      start_date: (fd.get('start_date') as string) || null,
      due_date: (fd.get('due_date') as string) || null,
      completed_at: null, created_at: now, updated_at: now,
      client: client ? { id: client.id, name: client.name, company: client.company } : null,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', p: opt })
      const r = await createProjectAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Proyecto creado')
    })
  }

  function handleUpdate(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'update', id, patch: { title: String(fd.get('title') ?? '') } })
      const r = await updateProjectAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Proyecto actualizado')
    })
  }

  function handleStatusChange(fd: FormData) {
    const id     = String(fd.get('id') ?? '')
    const status = fd.get('status') as ProjectStatusClient
    startTransition(async () => {
      dispatch({ type: 'status', id, status })
      const r = await updateProjectStatusAction(fd)
      if ('error' in r) toast.error(r.error)
    })
  }

  function handleDelete(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const r = await deleteProjectAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Proyecto eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {optimistic.length} {optimistic.length === 1 ? 'proyecto' : 'proyectos'}
        </p>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          <Plus size={15} /> Nuevo proyecto
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Briefcase size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin proyectos freelance todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Agrega tu primer proyecto con el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimistic.map((p) => (
            <ClientProjectCard
              key={p.id}
              project={p}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <ClientProjectForm ref={formRef} clients={clients} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
