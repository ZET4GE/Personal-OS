import type { ProjectStat } from '@/types/analytics'
import Link from 'next/link'

interface TopProjectsTableProps {
  projects: ProjectStat[]
  username: string
}

export function TopProjectsTable({ projects, username }: TopProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Aún no hay visitas en proyectos.
      </p>
    )
  }

  const maxViews = Math.max(...projects.map((p) => p.views), 1)

  return (
    <div className="space-y-2">
      {projects.map((p, i) => {
        const pct = Math.round((p.views / maxViews) * 100)
        return (
          <div key={p.page_id} className="flex items-center gap-3">
            {/* Ranking */}
            <span className="w-5 shrink-0 text-right text-xs font-medium text-muted">
              {i + 1}
            </span>

            {/* Barra + nombre */}
            <div className="flex-1 overflow-hidden">
              <div className="mb-1 flex items-center justify-between gap-2">
                <Link
                  href={`/${username}/projects/${p.page_id}`}
                  target="_blank"
                  className="truncate text-sm font-medium hover:text-accent-600 hover:underline"
                >
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs font-semibold text-muted">
                  {p.views.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-accent-600 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
