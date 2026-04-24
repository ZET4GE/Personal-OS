'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, FileText, FolderOpen, ListChecks, Target, X } from 'lucide-react'
import { toast } from 'sonner'
import { PROJECT_STATUS_LABELS } from '@/types/projects'
import type { GoalDetailData, GoalDetailProgress } from '@/services/goal-detail'
import type { GoalLinkEntityType } from '@/services/goal-links'
import { unlinkEntityFromGoal } from '@/services/goal-links'
import { AddToGoalModal } from '@/components/goals/AddToGoalModal'

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
  const [projects, setProjects] = useState(detail.projects)
  const [habits, setHabits] = useState(detail.habits)
  const [routines, setRoutines] = useState(detail.routines)
  const [notes, setNotes] = useState(detail.notes)
  const currentHours = (detail.goal.current_time ?? 0) / 3600
  const targetHours = (detail.goal.target_time ?? 0) / 3600
  const timeProgress = detail.goal.target_time && detail.goal.target_time > 0
    ? Math.min(1, (detail.goal.current_time ?? 0) / detail.goal.target_time)
    : 0
  const linkedIds = useMemo(
    () => ({
      project: projects.map((item) => item.id),
      habit: habits.map((item) => item.id),
      routine: routines.map((item) => item.id),
      note: notes.map((item) => item.id),
    }),
    [projects, habits, routines, notes],
  )

  async function handleUnlink(entityType: GoalLinkEntityType, entityId: string) {
    const result = await unlinkEntityFromGoal(detail.goal.id, entityType, entityId)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    if (entityType === 'project') setProjects((current) => current.filter((item) => item.id !== entityId))
    if (entityType === 'habit') setHabits((current) => current.filter((item) => item.id !== entityId))
    if (entityType === 'routine') setRoutines((current) => current.filter((item) => item.id !== entityId))
    if (entityType === 'note') setNotes((current) => current.filter((item) => item.id !== entityId))

    toast.success('Entidad desvinculada')
  }

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
            <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-accent-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, progress.progress * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-surface-elevated px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Proyectos</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.projects_progress * 100)}%</p>
          </div>
          <div className="rounded-lg bg-surface-elevated px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Habitos</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.habits_progress * 100)}%</p>
          </div>
          <div className="rounded-lg bg-surface-elevated px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted">Rutinas</p>
            <p className="mt-1 text-sm font-medium text-text">{Math.round(progress.routines_progress * 100)}%</p>
          </div>
        </div>

        {(detail.goal.target_time ?? 0) > 0 || (detail.goal.current_time ?? 0) > 0 ? (
          <div className="mt-4 rounded-xl border border-border bg-surface-elevated p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">Tiempo invertido</p>
                <p className="mt-1 text-sm font-medium text-text">
                  {currentHours.toFixed(1)}h / {targetHours.toFixed(1)}h
                </p>
              </div>
              <span className="text-xs font-medium text-muted">{Math.round(timeProgress * 100)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-accent-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, timeProgress * 100))}%` }}
              />
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Proyectos" icon={FolderOpen}>
          <div className="mb-4 flex justify-end">
            <AddToGoalModal
              goalId={detail.goal.id}
              entityType="project"
              linkedIds={linkedIds.project}
              onLinked={(entity) => {
                setProjects((current) => [
                  {
                    id: entity.id,
                    user_id: detail.goal.user_id,
                    title: entity.title,
                    description: entity.description,
                    tech_stack: [],
                    status: 'in_progress',
                    is_public: false,
                    github_url: null,
                    live_url: null,
                    image_url: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  ...current,
                ])
              }}
            />
          </div>
          {projects.length === 0 ? (
            <EmptyState label="proyectos" />
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="rounded-lg bg-surface-elevated px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text">{project.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{PROJECT_STATUS_LABELS[project.status]}</span>
                      <button
                        type="button"
                        onClick={() => void handleUnlink('project', project.id)}
                        className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
          <div className="mb-4 flex justify-end">
            <AddToGoalModal
              goalId={detail.goal.id}
              entityType="habit"
              linkedIds={linkedIds.habit}
              onLinked={(entity) => {
                setHabits((current) => [
                  {
                    id: entity.id,
                    user_id: detail.goal.user_id,
                    name: entity.title,
                    description: entity.description,
                    icon: null,
                    color: 'blue',
                    frequency: 'daily',
                    target_days: [0, 1, 2, 3, 4, 5, 6],
                    reminder_time: null,
                    is_active: true,
                    order_index: 0,
                    created_at: new Date().toISOString(),
                    today_completed: false,
                  },
                  ...current,
                ])
              }}
            />
          </div>
          {habits.length === 0 ? (
            <EmptyState label="habitos" />
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{habit.name}</p>
                    {habit.description && (
                      <p className="mt-1 text-xs text-muted line-clamp-1">{habit.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs ${habit.today_completed ? 'text-emerald-500' : 'text-muted'}`}>
                      {habit.today_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      {habit.today_completed ? 'Completado hoy' : 'Pendiente'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleUnlink('habit', habit.id)}
                      className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Rutinas" icon={ListChecks}>
          <div className="mb-4 flex justify-end">
            <AddToGoalModal
              goalId={detail.goal.id}
              entityType="routine"
              linkedIds={linkedIds.routine}
              onLinked={(entity) => {
                setRoutines((current) => [
                  {
                    id: entity.id,
                    user_id: detail.goal.user_id,
                    name: entity.title,
                    description: entity.description,
                    time_of_day: 'morning',
                    estimated_minutes: null,
                    is_active: true,
                    order_index: 0,
                    created_at: new Date().toISOString(),
                    today_completed: false,
                  },
                  ...current,
                ])
              }}
            />
          </div>
          {routines.length === 0 ? (
            <EmptyState label="rutinas" />
          ) : (
            <div className="space-y-3">
              {routines.map((routine) => (
                <div key={routine.id} className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{routine.name}</p>
                    {routine.description && (
                      <p className="mt-1 text-xs text-muted line-clamp-1">{routine.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs ${routine.today_completed ? 'text-emerald-500' : 'text-muted'}`}>
                      {routine.today_completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      {routine.today_completed ? 'Completada hoy' : 'Pendiente'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleUnlink('routine', routine.id)}
                      className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Notas" icon={FileText}>
          <div className="mb-4 flex justify-end">
            <AddToGoalModal
              goalId={detail.goal.id}
              entityType="note"
              linkedIds={linkedIds.note}
              onLinked={(entity) => {
                setNotes((current) => [
                  {
                    id: entity.id,
                    user_id: detail.goal.user_id,
                    folder_id: null,
                    title: entity.title,
                    slug: '',
                    content: '',
                    excerpt: entity.description,
                    tags: [],
                    is_pinned: false,
                    is_archived: false,
                    is_public: false,
                    word_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  ...current,
                ])
              }}
            />
          </div>
          {notes.length === 0 ? (
            <EmptyState label="notas" />
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-surface-elevated px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text">{note.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{note.is_public ? 'Publica' : 'Privada'}</span>
                      <button
                        type="button"
                        onClick={() => void handleUnlink('note', note.id)}
                        className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
