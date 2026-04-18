'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import {
  JOB_INTERVIEW_STAGE_LABELS,
  JOB_INTERVIEW_STAGES,
  JOB_INTERVIEW_OUTCOME_LABELS,
  JOB_INTERVIEW_OUTCOME_STYLES,
  JOB_INTERVIEW_OUTCOMES,
  JOB_PRIORITY_LABELS,
  JOB_PRIORITY_STYLES,
  JOB_STATUS_LABELS,
  JOB_STATUS_STYLES,
  JOB_STATUSES,
} from '@/types/jobs'
import type { JobApplication } from '@/types/jobs'
import { formatDate } from '@/lib/utils'
import { TagSelector } from '@/components/tags/TagSelector'

interface JobCardProps {
  job: JobApplication & { isOptimistic?: boolean }
  onEdit:         (job: JobApplication) => void
  onDelete:       (formData: FormData) => void
  onStatusChange: (formData: FormData) => void
  onCreateInterview: (formData: FormData) => void
  onDeleteInterview: (formData: FormData) => void
  onUpdateInterviewOutcome: (formData: FormData) => void
}

export function JobCard({
  job,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateInterview,
  onDeleteInterview,
  onUpdateInterviewOutcome,
}: JobCardProps) {
  const interviews = job.interviews ?? []
  const nextInterview = interviews.find((interview) => {
    return new Date(interview.scheduled_at).getTime() >= Date.now()
      && (interview.outcome ?? 'pending') === 'pending'
  })
  const followUpOverdue =
    job.next_follow_up_at
    && new Date(job.next_follow_up_at).getTime() < Date.now()
    && ['applied', 'interview'].includes(job.status)

  return (
    <article
      className={[
        'group relative rounded-xl border bg-surface p-4 transition-shadow hover:shadow-sm',
        job.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-4">
        {/* Company avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {job.company[0]?.toUpperCase()}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-tight truncate">{job.company}</p>
            {job.link && (
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent-600 transition-colors"
                title="Ver oferta"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <p className="text-sm text-muted truncate">{job.role}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{formatDate(job.applied_at)}</span>
            <span className={['rounded-full px-2 py-0.5 font-medium', JOB_PRIORITY_STYLES[job.priority ?? 'medium']].join(' ')}>
              {JOB_PRIORITY_LABELS[job.priority ?? 'medium']}
            </span>
            {job.source && <span>{job.source}</span>}
            {job.salary_range && <span>{job.salary_range}</span>}
          </div>
        </div>

        {/* Status + acciones */}
        <div className="flex shrink-0 items-center gap-2">
          <TagSelector entityId={job.id} entityType="job" compact />
          {/* Status select — dispara optimistic update */}
          <form action={onStatusChange}>
            <input type="hidden" name="id" value={job.id} />
            <select
              name="status"
              defaultValue={job.status}
              onChange={(e) => {
                const fd = new FormData()
                fd.set('id', job.id)
                fd.set('status', e.target.value)
                onStatusChange(fd)
              }}
              disabled={job.isOptimistic}
              className={[
                'rounded-full border-0 px-2 py-0.5 text-xs font-medium cursor-pointer outline-none',
                JOB_STATUS_STYLES[job.status],
              ].join(' ')}
              aria-label="Cambiar estado"
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {JOB_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </form>

          {/* Botones visibles al hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(job)}
              disabled={job.isOptimistic}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>

            {/* Delete: usa form para poder llamar la Server Action como formAction */}
            <form
              action={onDelete}
              onSubmit={(e) => {
                if (!confirm('¿Eliminar esta postulación?')) e.preventDefault()
              }}
            >
              <input type="hidden" name="id" value={job.id} />
              <button
                type="submit"
                disabled={job.isOptimistic}
                className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {(job.next_follow_up_at || nextInterview) && (
        <div className="mt-3 grid gap-2 border-t pt-3 text-xs sm:grid-cols-2" style={{ borderColor: 'var(--color-border)' }}>
          {job.next_follow_up_at && (
            <p className={followUpOverdue ? 'font-medium text-red-400' : 'text-muted'}>
              Seguimiento: {formatDate(job.next_follow_up_at)}
            </p>
          )}
          {nextInterview && (
            <p className="font-medium text-blue-300">
              Proxima entrevista: {formatDate(nextInterview.scheduled_at)}
            </p>
          )}
        </div>
      )}

      {/* Notas expandibles */}
      {job.notes && (
        <p className="mt-3 border-t pt-3 text-xs text-muted leading-relaxed line-clamp-2"
           style={{ borderColor: 'var(--color-border)' }}>
          {job.notes}
        </p>
      )}

      <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
        <details className="group/interview">
          <summary className="cursor-pointer list-none text-xs font-medium text-accent-400 transition-colors hover:text-accent-300">
            + Agregar entrevista
          </summary>

          <form action={onCreateInterview} className="mt-3 grid gap-2 sm:grid-cols-4">
            <input type="hidden" name="job_id" value={job.id} />
            <input
              name="title"
              type="text"
              placeholder="Entrevista"
              className={smallInputCls}
            />
            <input
              name="scheduled_at"
              type="datetime-local"
              required
              className={smallInputCls}
            />
            <select name="stage" defaultValue="screening" className={smallInputCls}>
              {JOB_INTERVIEW_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {JOB_INTERVIEW_STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={job.isOptimistic}
              className="rounded-lg bg-accent-600 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Guardar
            </button>
          </form>
        </details>

        {interviews.length > 0 && (
          <div className="mt-3 space-y-2">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-hover px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text">{interview.title}</p>
                  <p className="text-muted">
                    {JOB_INTERVIEW_STAGE_LABELS[interview.stage]} - {formatDate(interview.scheduled_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    defaultValue={interview.outcome ?? 'pending'}
                    onChange={(event) => {
                      const fd = new FormData()
                      fd.set('id', interview.id)
                      fd.set('outcome', event.target.value)
                      onUpdateInterviewOutcome(fd)
                    }}
                    className={[
                      'rounded-full border-0 px-2 py-1 text-[11px] font-medium outline-none',
                      JOB_INTERVIEW_OUTCOME_STYLES[interview.outcome ?? 'pending'],
                    ].join(' ')}
                    aria-label="Resultado de entrevista"
                  >
                    {JOB_INTERVIEW_OUTCOMES.map((outcome) => (
                      <option key={outcome} value={outcome}>
                        {JOB_INTERVIEW_OUTCOME_LABELS[outcome]}
                      </option>
                    ))}
                  </select>
                  <form
                    action={onDeleteInterview}
                    onSubmit={(e) => {
                      if (!confirm('Eliminar esta entrevista?')) e.preventDefault()
                    }}
                  >
                    <input type="hidden" name="id" value={interview.id} />
                    <button
                      type="submit"
                      className="rounded p-1.5 text-slate-400 hover:bg-red-900/20 hover:text-red-400"
                      aria-label="Eliminar entrevista"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

const smallInputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none transition-colors ' +
  'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20'
