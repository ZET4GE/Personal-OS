'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { Education } from '@/types/cv'

function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

function formatDateRange(edu: Education): string {
  if (!edu.start_date && !edu.end_date) return ''
  if (edu.start_date && !edu.end_date) return formatMonthYear(edu.start_date)
  if (!edu.start_date && edu.end_date) return formatMonthYear(edu.end_date)
  return `${formatMonthYear(edu.start_date!)} — ${formatMonthYear(edu.end_date!)}`
}

interface EducationCardProps {
  item: Education & { isOptimistic?: boolean }
  onEdit:   (item: Education) => void
  onDelete: (formData: FormData) => void
}

export function EducationCard({ item, onEdit, onDelete }: EducationCardProps) {
  const dateRange = formatDateRange(item)

  return (
    <article
      className={[
        'group relative rounded-xl border bg-surface p-5 transition-shadow hover:shadow-sm',
        item.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Actions */}
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(item)}
          disabled={item.isOptimistic}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40"
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
        <form
          action={onDelete}
          onSubmit={(e) => {
            if (!confirm('¿Eliminar esta entrada de educación?')) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            disabled={item.isOptimistic}
            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40"
            aria-label="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="pr-16 space-y-0.5">
        <p className="font-semibold leading-snug">
          {item.degree}
          {item.field && <span className="font-normal text-muted"> · {item.field}</span>}
        </p>
        <p className="text-sm text-muted">{item.institution}</p>
        {dateRange && <p className="text-xs text-muted pt-0.5">{dateRange}</p>}
        {item.description && (
          <p className="pt-2 text-sm text-muted leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}
      </div>
    </article>
  )
}
