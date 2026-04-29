import Link from 'next/link'
import { GitBranch, Route, Calendar } from 'lucide-react'
import type { LearningRoadmapSummary } from '@/types/roadmaps'

const ROADMAP_TYPE_LABELS: Record<LearningRoadmapSummary['type'], string> = {
  free: 'Libre',
  structured: 'Plan guiado',
  goal_based: 'Basado en meta',
}

function fmtDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

interface PublicRoadmapsGridProps {
  roadmaps: LearningRoadmapSummary[]
  username: string
}

export function PublicRoadmapsGrid({ roadmaps, username }: PublicRoadmapsGridProps) {
  if (roadmaps.length === 0) {
    return (
      <div className="public-card public-body flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <GitBranch size={32} className="mb-3 text-muted" />
        <p className="text-sm text-muted">Sin roadmaps publicos todavia.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {roadmaps.map((roadmap) => (
        <Link
          key={roadmap.id}
          href={`/${username}/roadmaps/${roadmap.id}`}
          className="public-card public-body group flex flex-col rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="public-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <Route size={12} />
              {ROADMAP_TYPE_LABELS[roadmap.type]}
            </span>
            {roadmap.nodeCount > 0 && (
              <span className="text-[11px] text-muted">{roadmap.nodeCount} nodos</span>
            )}
          </div>

          <h3 className="public-heading text-base font-semibold leading-tight text-text transition-colors group-hover:opacity-85">
            {roadmap.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {roadmap.description || 'Camino publicado para ver objetivos, nodos y progreso.'}
          </p>

          {/* Progress bar */}
          {roadmap.nodeCount > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                <span>Progreso</span>
                <span className="font-semibold text-foreground">{roadmap.progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-[var(--public-accent)]"
                  style={{ width: `${roadmap.progress}%` }}
                />
              </div>
            </div>
          )}

          {roadmap.updated_at && (
            <p className="mt-3 flex items-center gap-1 text-[11px] text-muted">
              <Calendar size={11} />
              {fmtDate(roadmap.updated_at)}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
