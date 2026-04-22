'use client'

import Link from 'next/link'
import { Pencil, Trash2, AlertCircle } from 'lucide-react'
import { isOverdue } from '@/lib/utils'
import { PRIORITY_LABELS, PROJECT_STATUSES_CLIENT, PROJECT_STATUS_CLIENT_LABELS } from '@/types/clients'
import type { ClientProject } from '@/types/clients'
import { PaymentProgress } from './PaymentProgress'
import { TagSelector } from '@/components/tags/TagSelector'

interface ClientProjectCardProps {
  project:          ClientProject & { isOptimistic?: boolean }
  onEdit:           (p: ClientProject) => void
  onDelete:         (fd: FormData) => void
  onStatusChange:   (fd: FormData) => void
}

export function ClientProjectCard({ project, onEdit, onDelete, onStatusChange }: ClientProjectCardProps) {
  const overdue = isOverdue(project.due_date) && project.status !== 'completed' && project.status !== 'cancelled'

  return (
    <article
      className={[
        'group rounded-xl border bg-surface p-4 transition-shadow hover:shadow-sm',
        project.isOptimistic ? 'opacity-60' : '',
        overdue ? 'border-red-200 dark:border-red-900' : '',
      ].join(' ')}
      style={!overdue ? { borderColor: 'var(--color-border)' } : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Priority indicator */}
        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          project.priority === 'high'   ? 'bg-red-500' :
          project.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
        }`} title={PRIORITY_LABELS[project.priority]} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/freelance/${project.id}`} className="font-semibold hover:text-accent-600 transition-colors truncate">
              {project.title}
            </Link>
            {overdue && (
              <span className="flex items-center gap-0.5 text-xs text-red-500">
                <AlertCircle size={12} /> Vencido
              </span>
            )}
          </div>

          {project.client && (
            <p className="text-xs text-muted mt-0.5">
              {project.client.name}{project.client.company ? ` · ${project.client.company}` : ''}
            </p>
          )}

          {project.due_date && (
            <p className={`mt-0.5 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-muted'}`}>
              Entrega: {new Date(project.due_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}

          {/* Payment progress */}
          {project.budget && (
            <div className="mt-2">
              <PaymentProgress paidAmount={project.paid_amount} budget={project.budget} currency={project.currency} />
            </div>
          )}
        </div>

        {/* Status + acciones */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <TagSelector entityId={project.id} entityType="freelance" compact />
          {/* Status select */}
          <form action={onStatusChange}>
            <input type="hidden" name="id" value={project.id} />
            <select
              name="status"
              defaultValue={project.status}
              onChange={(e) => {
                const fd = new FormData()
                fd.set('id', project.id)
                fd.set('status', e.target.value)
                onStatusChange(fd)
              }}
              disabled={project.isOptimistic}
              className={[
                'rounded-full border-0 px-2 py-0.5 text-xs font-medium cursor-pointer outline-none',
                PROJECT_STATUS_CLIENT_LABELS[project.status] ? '' : '',
              ].join(' ')}
              aria-label="Cambiar estado"
            >
              {PROJECT_STATUSES_CLIENT.map((s) => (
                <option key={s} value={s}>{PROJECT_STATUS_CLIENT_LABELS[s]}</option>
              ))}
            </select>
          </form>

          {/* Edit / Delete */}
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={() => onEdit(project)} disabled={project.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40" aria-label="Editar">
              <Pencil size={13} />
            </button>
            <form action={onDelete} onSubmit={(e) => { if (!confirm('¿Eliminar este proyecto?')) e.preventDefault() }}>
              <input type="hidden" name="id" value={project.id} />
              <button type="submit" disabled={project.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40" aria-label="Eliminar">
                <Trash2 size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  )
}
