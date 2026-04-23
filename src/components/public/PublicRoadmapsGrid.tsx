import Link from 'next/link'
import { GitBranch, Route } from 'lucide-react'
import type { LearningRoadmap } from '@/types/roadmaps'

const ROADMAP_TYPE_LABELS: Record<LearningRoadmap['type'], string> = {
  free: 'Libre',
  structured: 'Plan guiado',
  goal_based: 'Basado en meta',
}

interface PublicRoadmapsGridProps {
  roadmaps: LearningRoadmap[]
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
          className="public-card public-body group rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="public-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
              <Route size={12} />
              {ROADMAP_TYPE_LABELS[roadmap.type]}
            </span>
          </div>
          <h3 className="public-heading text-base font-semibold leading-tight text-text transition-colors group-hover:opacity-85">
            {roadmap.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
            {roadmap.description || 'Camino publicado para ver objetivos, nodos y progreso.'}
          </p>
        </Link>
      ))}
    </div>
  )
}
