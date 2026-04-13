import Link from 'next/link'
import { GitBranch, ExternalLink, FolderOpen } from 'lucide-react'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from '@/types/projects'
import type { Project } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Single project card (versión de sólo lectura)
// ─────────────────────────────────────────────────────────────

const MAX_TAGS = 5

function PublicProjectCard({ project, username }: { project: Project; username: string }) {
  const visibleTags = project.tech_stack.slice(0, MAX_TAGS)
  const hiddenCount = project.tech_stack.length - MAX_TAGS

  return (
    <article
      className="flex flex-col rounded-xl border bg-surface transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Clickable area → project detail */}
      <Link
        href={`/${username}/projects/${project.id}`}
        className="flex flex-1 flex-col gap-3 p-5"
      >
        {/* Title */}
        <h3 className="font-semibold leading-tight hover:text-accent-600 transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Status */}
        <span
          className={[
            'inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium',
            PROJECT_STATUS_STYLES[project.status],
          ].join(' ')}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>

        {/* Tech tags */}
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
      </Link>

      {/* Footer: external links — fuera del Link principal para evitar anidamiento */}
      {(project.github_url || project.live_url) && (
        <div
          className="flex items-center gap-3 border-t px-5 py-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <GitBranch size={13} /> Código
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <ExternalLink size={13} /> Demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}

// ─────────────────────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────────────────────

interface PublicProjectsGridProps {
  projects: Project[]
  username: string
}

export function PublicProjectsGrid({ projects, username }: PublicProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <FolderOpen size={32} className="mb-3 text-muted" />
        <p className="text-sm text-muted">Sin proyectos públicos todavía.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <PublicProjectCard key={project.id} project={project} username={username} />
      ))}
    </div>
  )
}
