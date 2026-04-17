'use client'

import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { CVCourse } from '@/types/cv'

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

interface CVCourseCardProps {
  item: CVCourse & { isOptimistic?: boolean }
  onEdit: (item: CVCourse) => void
  onDelete: (formData: FormData) => void
}

export function CVCourseCard({ item, onEdit, onDelete }: CVCourseCardProps) {
  return (
    <article
      className={[
        'group relative rounded-xl border bg-surface p-5 transition-shadow hover:shadow-sm',
        item.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onEdit(item)} disabled={item.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40" aria-label="Editar">
          <Pencil size={14} />
        </button>
        <form action={onDelete} onSubmit={(e) => { if (!confirm('Eliminar este curso?')) e.preventDefault() }}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" disabled={item.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40" aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="space-y-1 pr-16">
        <p className="font-semibold leading-snug">{item.title}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {item.provider && <span>{item.provider}</span>}
          {item.completed_at && <span>{formatDate(item.completed_at)}</span>}
          {item.credential_url && (
            <a href={item.credential_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              Credencial <ExternalLink size={12} />
            </a>
          )}
        </div>
        {item.description && <p className="pt-2 text-sm leading-relaxed text-muted line-clamp-3">{item.description}</p>}
      </div>
    </article>
  )
}
