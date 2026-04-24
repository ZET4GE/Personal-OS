import Link from 'next/link'
import { CheckCircle2, CircleDashed, Clock3, Route, Target } from 'lucide-react'
import type { LearningNodeStatus, LearningRoadmapDetail } from '@/types/roadmaps'

const STATUS_LABELS: Record<LearningNodeStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  blocked: 'Bloqueado',
}

const STATUS_STYLES: Record<LearningNodeStatus, string> = {
  pending: 'bg-slate-500/10 text-slate-300',
  in_progress: 'bg-cyan-500/10 text-cyan-300',
  completed: 'bg-emerald-500/10 text-emerald-300',
  blocked: 'bg-red-500/10 text-red-300',
}

function statusIcon(status: LearningNodeStatus) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-emerald-300" />
  if (status === 'in_progress') return <Clock3 size={16} className="text-cyan-300" />
  return <CircleDashed size={16} className="text-muted" />
}

function getAverageProgress(detail: LearningRoadmapDetail) {
  if (detail.nodes.length === 0) return 0
  const total = detail.nodes.reduce((acc, node) => acc + Number(node.progress ?? 0), 0)
  return Math.round((total / detail.nodes.length) * 100)
}

interface PublicRoadmapDetailProps {
  detail: LearningRoadmapDetail
  username: string
  displayName: string
}

export function PublicRoadmapDetail({ detail, username, displayName }: PublicRoadmapDetailProps) {
  const progress = getAverageProgress(detail)

  return (
    <article className="public-body space-y-6">
      <Link href={`/${username}/roadmaps`} className="text-sm font-medium text-muted transition-colors hover:text-text">
        Volver a roadmaps
      </Link>

      <header className="public-card overflow-hidden rounded-2xl border p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="public-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            <Route size={13} />
            Roadmap publico
          </span>
          <span className="rounded-full bg-[var(--public-accent-soft)] px-3 py-1 text-xs font-medium text-muted">
            {displayName}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_180px] md:items-end">
          <div>
            <h1 className="public-heading text-3xl font-bold tracking-tight text-text">{detail.roadmap.title}</h1>
            {detail.roadmap.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{detail.roadmap.description}</p>
            )}
          </div>

          <div className="public-card rounded-xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Progreso</p>
            <p className="mt-2 text-3xl font-bold text-text">{progress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: 'var(--public-accent)' }} />
            </div>
          </div>
        </div>
      </header>

      <section className="public-card rounded-2xl border p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text">Camino</h2>
            <p className="text-sm text-muted">Nodos publicados y metas visibles asociadas.</p>
          </div>
          <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-muted">
            {detail.nodes.length} nodos
          </span>
        </div>

        {detail.nodes.length === 0 ? (
            <div className="public-card rounded-xl border border-dashed py-12 text-center">
            <p className="text-sm text-muted">Este roadmap todavia no tiene nodos publicados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {detail.nodes.map((node, index) => {
              const nodeProgress = Math.round(Number(node.progress ?? 0) * 100)

              return (
                <div key={node.id} className="public-card grid gap-3 rounded-xl border p-4 sm:grid-cols-[36px_1fr]">
                  <div className="flex flex-row items-center gap-3 sm:flex-col">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                      {statusIcon(node.status)}
                    </div>
                    {index < detail.nodes.length - 1 && <div className="hidden h-full w-px bg-border sm:block" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {node.level && (
                        <span className="rounded-full bg-[var(--public-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                          {node.level}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[node.status]}`}>
                        {STATUS_LABELS[node.status]}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-text">{node.title}</h3>
                    {node.description && (
                      <p className="mt-2 text-sm leading-6 text-muted">{node.description}</p>
                    )}

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/30">
                        <div className="h-full rounded-full" style={{ width: `${nodeProgress}%`, backgroundColor: 'var(--public-accent)' }} />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-muted">{nodeProgress}%</span>
                    </div>

                    {node.goals.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {node.goals.map((goal) => (
                          <span
                            key={goal.id}
                            className="public-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          >
                            <Target size={12} />
                            {goal.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </article>
  )
}
