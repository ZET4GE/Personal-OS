import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/services/projects'
import { ProjectsClient } from '@/components/projects/ProjectsClient'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES } from '@/types/projects'
import type { ProjectStatus } from '@/types/projects'

export const metadata: Metadata = { title: 'Proyectos' }

// ─────────────────────────────────────────────────────────────
// Tipos — searchParams es Promise en Next.js 16
// ─────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ status?: string; visibility?: string }>
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { status, visibility } = await searchParams

  const supabase = await createClient()
  const { data: allProjects } = await getProjects(supabase)

  // Filtrado en memoria (evita queries extra; los proyectos son pocos)
  let projects = allProjects ?? []

  const statusFilter = PROJECT_STATUSES.includes(status as ProjectStatus)
    ? (status as ProjectStatus)
    : undefined

  if (statusFilter) {
    projects = projects.filter((p) => p.status === statusFilter)
  }
  if (visibility === 'public') {
    projects = projects.filter((p) => p.is_public)
  } else if (visibility === 'private') {
    projects = projects.filter((p) => !p.is_public)
  }

  const publicCount  = (allProjects ?? []).filter((p) => p.is_public).length
  const privateCount = (allProjects ?? []).filter((p) => !p.is_public).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Proyectos</h2>
        <p className="text-sm text-muted">
          Gestiona tus proyectos. Los públicos aparecerán en tu portafolio.
        </p>
      </div>

      {/* Filtros — links del servidor */}
      <div className="flex flex-wrap gap-3">
        {/* Por status */}
        <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por estado">
          <FilterTab href="/projects" active={!statusFilter && !visibility} label="Todos" />
          {PROJECT_STATUSES.map((s) => (
            <FilterTab
              key={s}
              href={`/projects?status=${s}`}
              active={statusFilter === s}
              label={PROJECT_STATUS_LABELS[s]}
            />
          ))}
        </nav>

        {/* Separador */}
        <div className="w-px bg-border" />

        {/* Por visibilidad */}
        <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por visibilidad">
          <FilterTab
            href="/projects?visibility=public"
            active={visibility === 'public'}
            label={`Públicos (${publicCount})`}
            accent="green"
          />
          <FilterTab
            href="/projects?visibility=private"
            active={visibility === 'private'}
            label={`Privados (${privateCount})`}
          />
        </nav>
      </div>

      {/* Grid con optimistic updates */}
      <ProjectsClient projects={projects} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FilterTab
// ─────────────────────────────────────────────────────────────

function FilterTab({
  href,
  active,
  label,
  accent = 'blue',
}: {
  href: string
  active: boolean
  label: string
  accent?: 'blue' | 'green'
}) {
  const activeClass =
    accent === 'green'
      ? 'bg-green-600 text-white'
      : 'bg-accent-600 text-white'

  return (
    <Link
      href={href}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? activeClass
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}
