'use client'

import { Pencil, Trash2, MapPin } from 'lucide-react'
import type { WorkExperience } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

function formatDateRange(exp: WorkExperience): string {
  const start = formatMonthYear(exp.start_date)
  if (exp.is_current) return `${start} — Presente`
  if (!exp.end_date) return start
  return `${start} — ${formatMonthYear(exp.end_date)}`
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface ExperienceCardProps {
  item: WorkExperience & { isOptimistic?: boolean }
  onEdit:   (item: WorkExperience) => void
  onDelete: (formData: FormData) => void
}

export function ExperienceCard({ item, onEdit, onDelete }: ExperienceCardProps) {
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
            if (!confirm('¿Eliminar esta experiencia?')) e.preventDefault()
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
      <div className="flex items-start gap-4 pr-16">
        {/* Company initial */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {item.company[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="font-semibold leading-snug">{item.role}</p>
          <p className="text-sm text-muted">{item.company}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
            <span className="text-xs text-muted">{formatDateRange(item)}</span>
            {item.location && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin size={11} />
                {item.location}
              </span>
            )}
          </div>

          {item.description && (
            <p className="pt-2 text-sm text-muted leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
