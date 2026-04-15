'use client'

import { Globe, Lock, GitBranch, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from '@/types/projects'
import type { Project } from '@/types/projects'
import { GoalSelector } from '@/components/goals/GoalSelector'

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const MAX_VISIBLE_TAGS = 4

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project:        Project & { isOptimistic?: boolean }
  onEdit:         (project: Project) => void
  onDelete:       (formData: FormData) => void
  onTogglePublic: (formData: FormData) => void
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onTogglePublic,
}: ProjectCardProps) {
  const visibleTags = project.tech_stack.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = project.tech_stack.length - MAX_VISIBLE_TAGS

  function handleToggle() {
    const fd = new FormData()
    fd.set('id', project.id)
    fd.set('is_public', String(!project.is_public))
    onTogglePublic(fd)
  }

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`¿Eliminar "${project.title}"?`)) e.preventDefault()
  }

  return (
    <article
      className={[
        'group flex flex-col rounded-xl border bg-surface transition-shadow hover:shadow-md',
        project.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-1">{project.title}</h3>

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={project.isOptimistic}
            title={project.is_public ? 'Hacer privado' : 'Hacer público'}
            className={[
              'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              'transition-colors disabled:opacity-40',
              project.is_public
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
            ].join(' ')}
          >
            {project.is_public ? (
              <><Globe size={11} /> Público</>
            ) : (
              <><Lock size={11} /> Privado</>
            )}
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Status badge */}
        <span
          className={[
            'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium',
            PROJECT_STATUS_STYLES[project.status],
          ].join(' ')}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>

        {/* Tech stack tags */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-muted dark:bg-slate-800">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: links + actions */}
      <div
        className="flex items-center justify-between border-t px-5 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* External links */}
        <div className="flex items-center gap-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
              title="Repositorio"
            >
              <GitBranch size={16} />
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
              title="Demo en vivo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Edit + Delete — visibles sólo en hover */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <GoalSelector entityId={project.id} entityType="project" />
          <button
            type="button"
            onClick={() => onEdit(project)}
            disabled={project.isOptimistic}
            className="rounded p-1.5 text-muted hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 disabled:opacity-40"
            aria-label="Editar"
          >
            <Pencil size={14} />
          </button>

          <form
            action={onDelete}
            onSubmit={handleDelete}
          >
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              disabled={project.isOptimistic}
              className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40"
              aria-label="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      </div>
    </article>
  )
}
