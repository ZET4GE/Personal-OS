'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import {
  createJobAction,
  updateJobAction,
  deleteJobAction,
  updateStatusAction,
} from '@/app/(dashboard)/jobs/actions'
import { JobCard } from './JobCard'
import { JobForm, type JobFormHandle } from './JobForm'
import type { JobApplication } from '@/types/jobs'

// ─────────────────────────────────────────────────────────────
// Optimistic state
// ─────────────────────────────────────────────────────────────

type OptimisticJob = JobApplication & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    job: OptimisticJob }
  | { type: 'delete'; id: string }
  | { type: 'status'; id: string; status: JobApplication['status'] }
  | { type: 'update'; id: string; patch: Partial<JobApplication> }

function optimisticReducer(state: OptimisticJob[], op: OptimisticOp): OptimisticJob[] {
  switch (op.type) {
    case 'add':
      return [op.job, ...state]
    case 'delete':
      return state.filter((j) => j.id !== op.id)
    case 'status':
      return state.map((j) => (j.id === op.id ? { ...j, status: op.status } : j))
    case 'update':
      return state.map((j) => (j.id === op.id ? { ...j, ...op.patch } : j))
    default:
      return state
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface JobsClientProps {
  jobs: JobApplication[]
}

export function JobsClient({ jobs }: JobsClientProps) {
  const [optimisticJobs, dispatch] = useOptimistic(jobs, optimisticReducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<JobFormHandle>(null)

  // ── Abrir modal ─────────────────────────────────────────────

  function openCreate() {
    formRef.current?.open(null)
  }

  function openEdit(job: JobApplication) {
    formRef.current?.open(job)
  }

  // ── Create ──────────────────────────────────────────────────

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimistic: OptimisticJob = {
      id:         `optimistic-${Date.now()}`,
      user_id:    '',
      company:    String(formData.get('company') ?? ''),
      role:       String(formData.get('role') ?? ''),
      status:     (formData.get('status') as JobApplication['status']) ?? 'applied',
      link:       (formData.get('link') as string) || null,
      notes:      (formData.get('notes') as string) || null,
      applied_at: (formData.get('applied_at') as string) || now,
      created_at: now,
      updated_at: now,
      isOptimistic: true,
    }

    startTransition(async () => {
      dispatch({ type: 'add', job: optimistic })
      const result = await createJobAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Postulación creada')
    })
  }

  // ── Update ──────────────────────────────────────────────────

  function handleUpdate(formData: FormData) {
    const id    = String(formData.get('id') ?? '')
    const patch = {
      company:    String(formData.get('company') ?? ''),
      role:       String(formData.get('role') ?? ''),
      status:     formData.get('status') as JobApplication['status'],
      link:       (formData.get('link') as string) || null,
      notes:      (formData.get('notes') as string) || null,
      applied_at: String(formData.get('applied_at') ?? ''),
    }

    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateJobAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Postulación actualizada')
    })
  }

  // ── Status change ───────────────────────────────────────────

  function handleStatusChange(formData: FormData) {
    const id     = String(formData.get('id') ?? '')
    const status = formData.get('status') as JobApplication['status']

    startTransition(async () => {
      dispatch({ type: 'status', id, status })
      const result = await updateStatusAction(formData)
      if (result.error) toast.error(result.error)
    })
  }

  // ── Delete ──────────────────────────────────────────────────

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')

    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteJobAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Postulación eliminada')
    })
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {optimisticJobs.length}{' '}
          {optimisticJobs.length === 1 ? 'postulación' : 'postulaciones'}
        </p>
        <button
          onClick={openCreate}
          aria-label="Agregar postulación"
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* Lista o empty state */}
      {optimisticJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Briefcase size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin postulaciones todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Agrega tu primera postulación con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimisticJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal form */}
      <JobForm
        ref={formRef}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}
