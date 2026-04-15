import { CheckCircle2, Circle, FileText, FolderOpen, ListChecks, Target } from 'lucide-react'
import { PROJECT_STATUS_LABELS } from '@/types/projects'
import type { GoalDetailData, GoalDetailProgress } from '@/services/goal-detail'

interface GoalDetailProps {
  detail: GoalDetailData
  progress: GoalDetailProgress
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof FolderOpen
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-accent-600" />
        <h2 className="text-sm font-semibold text-text">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted">No hay {label} vinculados.</p>
}

export function GoalDetail({ detail, progress }: GoalDetailProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text">{detail.goal.title}</h2>
            {detail.goal.description && (
              <p className="mt-1 text-sm text-muted">{detail.goal.description}</p>
            )}
          </div>
          <div className="min-w-[180px]">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Progreso</span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, progress.progress * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-2 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Proyectos</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.projects_progress * 100)}%</p>
          </div>
          <div className="rounded-lg bg-surface-2 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Habitos</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.habits_progress * 100)}%</p>
          </div>
          <div className="rounded-lg bg-surface-2 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Rutinas</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.routines_progress * 100)}%</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Proyectos" icon={FolderOpen}>
          {detail.projects.length === 0 ? (
            <EmptyState label="proyectos" />
          ) : (
            <div className="space-y-3">
              {detail.projects.map((project) => (
                <div key={project.id} className="rounded-lg bg-surface-2 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text">{project.title}</p>
                    <span className="text-xs text-muted">{PROJECT_STATUS_LABELS[project.status]}</span>
                  </div>
                  {project.description && (
                    <p className="mt-1 text-xs text-muted line-clamp-2">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Habitos" icon={Target}>
          {detail.habits.length === 0 ? (
            <EmptyState label="habitos" />
          ) : (
            <div className="space-y-3">
              {detail.habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{habit.name}</p>
                    {habit.description && (
                      <p className="mt-1 text-xs text-muted line-clamp-1">{habit.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs ${habit.today_completed ? 'text-emerald-500' : 'text-muted'}`}>
                    {habit.today_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {habit.today_completed ? 'Completado hoy' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Rutinas" icon={ListChecks}>
          {detail.routines.length === 0 ? (
            <EmptyState label="rutinas" />
          ) : (
            <div className="space-y-3">
              {detail.routines.map((routine) => (
                <div key={routine.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{routine.name}</p>
                    {routine.description && (
                      <p className="mt-1 text-xs text-muted line-clamp-1">{routine.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs ${routine.today_completed ? 'text-emerald-500' : 'text-muted'}`}>
                    {routine.today_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {routine.today_completed ? 'Completada hoy' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Notas" icon={FileText}>
          {detail.notes.length === 0 ? (
            <EmptyState label="notas" />
          ) : (
            <div className="space-y-3">
              {detail.notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-surface-2 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text">{note.title}</p>
                    <span className="text-xs text-muted">{note.is_public ? 'Publica' : 'Privada'}</span>
                  </div>
                  {note.excerpt && (
                    <p className="mt-1 text-xs text-muted line-clamp-2">{note.excerpt}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
