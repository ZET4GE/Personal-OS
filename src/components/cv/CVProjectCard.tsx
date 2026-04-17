'use client'

import { ExternalLink, GitBranch, Pencil, Star, Trash2 } from 'lucide-react'
import type { CVProject } from '@/types/cv'

interface CVProjectCardProps {
  item: CVProject & { isOptimistic?: boolean }
  onEdit: (item: CVProject) => void
  onDelete: (formData: FormData) => void
}

export function CVProjectCard({ item, onEdit, onDelete }: CVProjectCardProps) {
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
        <form action={onDelete} onSubmit={(e) => { if (!confirm('Eliminar este proyecto?')) e.preventDefault() }}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" disabled={item.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40" aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </form>
      </div>

      <div className="space-y-3 pr-16">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-snug">{item.title}</p>
            {item.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                <Star size={11} /> Destacado
              </span>
            )}
          </div>
          {item.description && <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">{item.description}</p>}
        </div>

        {item.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tech_stack.map((tech) => (
              <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              Demo <ExternalLink size={12} />
            </a>
          )}
          {item.repo_url && (
            <a href={item.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              Repo <GitBranch size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
