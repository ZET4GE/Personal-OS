import Link from 'next/link'
import { GitBranch, ExternalLink, ChevronRight } from 'lucide-react'
import { TechBadge } from './TechBadge'
import { BackButton } from './BackButton'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_STYLES } from '@/types/projects'
import type { Project } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ProjectDetailProps {
  project: Project
  username: string
  displayName: string
}

// ─────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────

function Breadcrumbs({
  username,
  displayName,
  projectTitle,
}: {
  username: string
  displayName: string
  projectTitle: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-muted"
    >
      <Link
        href={`/${username}`}
        className="transition-colors hover:text-foreground"
      >
        {displayName}
      </Link>
      <ChevronRight size={12} className="shrink-0" />
      <span>Proyectos</span>
      <ChevronRight size={12} className="shrink-0" />
      <span className="truncate text-foreground">{projectTitle}</span>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function ProjectDetail({ project, username, displayName }: ProjectDetailProps) {
  return (
    <article className="public-body space-y-8">
      {/* Nav */}
      <div className="space-y-3">
        <BackButton href={`/${username}`} label={`Volver al perfil de ${displayName}`} />
        <Breadcrumbs
          username={username}
          displayName={displayName}
          projectTitle={project.title}
        />
      </div>

      {/* Screenshot */}
      {project.image_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={project.image_url}
          alt={`Captura de pantalla de ${project.title}`}
          className="w-full rounded-xl border object-cover"
          style={{ borderColor: 'var(--color-border)', maxHeight: '420px' }}
        />
      )}

      {/* Header */}
      <div className="space-y-3">
        {/* Status */}
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
            PROJECT_STATUS_STYLES[project.status],
          ].join(' ')}
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </span>

        {/* Title */}
        <h1 className="public-heading text-3xl font-bold tracking-tight">{project.title}</h1>

        {/* Links */}
        {(project.github_url || project.live_url) && (
          <div className="flex flex-wrap items-center gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="public-button inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <GitBranch size={15} />
                Ver código
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--public-accent-contrast)] transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--public-accent)' }}
              >
                <ExternalLink size={15} />
                Ver demo
              </a>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="public-divider border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Description */}
      {project.description && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Descripción
          </h2>
          <p className="leading-relaxed text-muted whitespace-pre-line">
            {project.description}
          </p>
        </section>
      )}

      {/* Tech stack */}
      {project.tech_stack.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Stack tecnológico
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.map((tag) => (
              <TechBadge key={tag} tag={tag} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
