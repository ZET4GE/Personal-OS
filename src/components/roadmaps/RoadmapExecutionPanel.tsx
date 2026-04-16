'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, ListTodo, PlayCircle, Repeat, Target } from 'lucide-react'
import type { Goal } from '@/types/goals'
import type { LearningNodeStatus, LearningRoadmap, LearningRoadmapNode } from '@/types/roadmaps'

interface RoadmapExecutionPanelProps {
  roadmap: LearningRoadmap
  nodes: LearningRoadmapNode[]
  primaryGoal: Goal | null
  activeFilter: LearningNodeStatus | 'all'
  onFilterChange: (filter: LearningNodeStatus | 'all') => void
}

function getActionLabel(type: LearningRoadmapNode['actions'][number]['entity_type']) {
  if (type === 'goal') return 'Sub-meta'
  if (type === 'habit') return 'Habito'
  if (type === 'routine') return 'Rutina'
  if (type === 'project') return 'Proyecto'
  return 'Tarea'
}

function getNextNode(nodes: LearningRoadmapNode[]) {
  return nodes.find((node) => node.status === 'in_progress')
    ?? nodes.find((node) => node.status === 'pending')
    ?? nodes.find((node) => node.progress > 0 && node.progress < 1 && node.status !== 'blocked')
    ?? null
}

function getStatusCount(nodes: LearningRoadmapNode[], status: LearningNodeStatus) {
  return nodes.filter((node) => node.status === status).length
}

export function RoadmapExecutionPanel({
  roadmap,
  nodes,
  primaryGoal,
  activeFilter,
  onFilterChange,
}: RoadmapExecutionPanelProps) {
  const totalProgress = Math.round(nodes.reduce((acc, node) => acc + node.progress, 0) / Math.max(nodes.length, 1) * 100)
  const nextNode = getNextNode(nodes)
  const todaysActions = nodes
    .filter((node) => node.status === 'in_progress' || node.id === nextNode?.id)
    .flatMap((node) => node.actions.map((action) => ({ node, action })))
    .filter(({ action }) => action.entity_type === 'habit' || action.entity_type === 'routine' || action.entity_type === 'goal')
    .slice(0, 4)

  const filters: { value: LearningNodeStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: nodes.length },
    { value: 'pending', label: 'Pendientes', count: getStatusCount(nodes, 'pending') },
    { value: 'in_progress', label: 'En progreso', count: getStatusCount(nodes, 'in_progress') },
    { value: 'blocked', label: 'Bloqueados', count: getStatusCount(nodes, 'blocked') },
    { value: 'completed', label: 'Completados', count: getStatusCount(nodes, 'completed') },
  ]

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                Ejecucion
              </span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted">
                {roadmap.type === 'goal_based' ? 'Guiado por meta' : roadmap.type === 'structured' ? 'Plan guiado' : 'Mapa libre'}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-text">{roadmap.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {primaryGoal ? `Meta principal: ${primaryGoal.title}` : 'Sin meta principal asignada'}
            </p>
          </div>

          <div className="w-full max-w-xs rounded-xl border border-border bg-surface-2 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Progreso total</p>
                <p className="mt-1 text-3xl font-semibold text-text">{totalProgress}%</p>
              </div>
              <Target size={22} className="text-cyan-400" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-lg font-semibold text-text">{getStatusCount(nodes, 'pending')}</p>
            <p className="text-xs text-muted">Pendientes</p>
          </div>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <p className="text-lg font-semibold text-cyan-200">{getStatusCount(nodes, 'in_progress')}</p>
            <p className="text-xs text-cyan-300/80">En progreso</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-lg font-semibold text-emerald-200">{getStatusCount(nodes, 'completed')}</p>
            <p className="text-xs text-emerald-300/80">Completados</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-lg font-semibold text-red-200">{getStatusCount(nodes, 'blocked')}</p>
            <p className="text-xs text-red-300/80">Bloqueados</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4">
          <div className="mb-2 flex items-center gap-2">
            {nextNode?.status === 'blocked' ? <AlertTriangle size={15} className="text-red-400" /> : <PlayCircle size={15} className="text-cyan-400" />}
            <p className="text-sm font-semibold text-text">Siguiente paso</p>
          </div>
          <p className="text-sm font-medium text-text">{nextNode?.title ?? 'No hay pasos pendientes'}</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {nextNode?.description ?? 'El roadmap no tiene nodos activos. Crea uno nuevo o revisa los completados.'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={[
                'rounded-full border px-3 py-1.5 text-xs transition-colors',
                activeFilter === filter.value
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
                  : 'border-border bg-surface-2 text-muted hover:text-text',
              ].join(' ')}
            >
              {filter.label} · {filter.count}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text">Hoy toca</h2>
            <p className="text-xs text-muted">Acciones generadas desde el paso actual.</p>
          </div>
          <Clock size={17} className="text-cyan-400" />
        </div>

        {todaysActions.length > 0 ? (
          <div className="space-y-2">
            {todaysActions.map(({ node, action }) => {
              const Icon = action.entity_type === 'routine' ? Repeat : action.entity_type === 'habit' ? ListTodo : Target

              return (
                <Link
                  key={action.id}
                  href={action.entity_type === 'routine' ? '/routines' : action.entity_type === 'habit' ? '/habits' : '/goals'}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-3 transition-colors hover:border-border-bright"
                >
                  <Icon size={15} className="text-cyan-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{getActionLabel(action.entity_type)}</p>
                    <p className="truncate text-xs text-muted">{node.title}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface-2 px-4 py-8 text-center">
            <CheckCircle2 size={22} className="mx-auto text-muted" />
            <p className="mt-2 text-sm font-medium text-text">Sin acciones para hoy</p>
            <p className="mt-1 text-xs leading-5 text-muted">Crea un habito, rutina o sub-meta desde el nodo actual.</p>
          </div>
        )}
      </div>
    </section>
  )
}
