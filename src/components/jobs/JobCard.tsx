'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { JOB_STATUS_LABELS, JOB_STATUS_STYLES, JOB_STATUSES } from '@/types/jobs'
import type { JobApplication } from '@/types/jobs'
import { formatDate } from '@/lib/utils'

interface JobCardProps {
  job: JobApplication & { isOptimistic?: boolean }
  onEdit:         (job: JobApplication) => void
  onDelete:       (formData: FormData) => void
  onStatusChange: (formData: FormData) => void
}

export function JobCard({ job, onEdit, onDelete, onStatusChange }: JobCardProps) {
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
          <p className="mt-1 text-xs text-muted">{formatDate(job.applied_at)}</p>
        </div>

        {/* Status + acciones */}
        <div className="flex shrink-0 items-center gap-2">
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

      {/* Notas expandibles */}
      {job.notes && (
        <p className="mt-3 border-t pt-3 text-xs text-muted leading-relaxed line-clamp-2"
           style={{ borderColor: 'var(--color-border)' }}>
          {job.notes}
        </p>
      )}
    </article>
  )
}
