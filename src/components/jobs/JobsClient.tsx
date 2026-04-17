'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import type { ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Briefcase, CalendarClock, Plus, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  createJobInterviewAction,
  createJobAction,
  deleteJobInterviewAction,
  deleteJobAction,
  updateJobAction,
  updateStatusAction,
} from '@/app/(dashboard)/jobs/actions'
import { JobCard } from './JobCard'
import { JobForm, type JobFormHandle } from './JobForm'
import type { JobApplication, JobTrackerStats } from '@/types/jobs'

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
  stats: JobTrackerStats
}

export function JobsClient({ jobs, stats }: JobsClientProps) {
  const [optimisticJobs, dispatch] = useOptimistic(jobs, optimisticReducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<JobFormHandle>(null)
  const router = useRouter()

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
      priority:   (formData.get('priority') as JobApplication['priority']) ?? 'medium',
      source:     (formData.get('source') as string) || null,
      salary_range: (formData.get('salary_range') as string) || null,
      next_follow_up_at: (formData.get('next_follow_up_at') as string) || null,
      applied_at: (formData.get('applied_at') as string) || now,
      created_at: now,
      updated_at: now,
      interviews: [],
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
      priority:   formData.get('priority') as JobApplication['priority'],
      source:     (formData.get('source') as string) || null,
      salary_range: (formData.get('salary_range') as string) || null,
      next_follow_up_at: (formData.get('next_follow_up_at') as string) || null,
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

  function handleCreateInterview(formData: FormData) {
    startTransition(async () => {
      const result = await createJobInterviewAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Entrevista agregada')
        router.refresh()
      }
    })
  }

  function handleDeleteInterview(formData: FormData) {
    startTransition(async () => {
      const result = await deleteJobInterviewAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Entrevista eliminada')
        router.refresh()
      }
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} label="Activas" value={stats.active_applications} />
        <StatCard icon={CalendarClock} label="Entrevistas proximas" value={stats.upcoming_interviews} />
        <StatCard icon={TrendingUp} label="Respuesta" value={`${stats.response_rate}%`} />
        <StatCard
          icon={stats.overdue_followups > 0 ? AlertTriangle : Target}
          label="Seguimientos vencidos"
          value={stats.overdue_followups}
          tone={stats.overdue_followups > 0 ? 'danger' : 'neutral'}
        />
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
              onCreateInterview={handleCreateInterview}
              onDeleteInterview={handleDeleteInterview}
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

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  tone?: 'neutral' | 'danger'
}) {
  return (
    <div
      className="rounded-xl border bg-surface p-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
        <Icon
          size={16}
          className={tone === 'danger' ? 'text-red-400' : 'text-accent-500'}
        />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  )
}
