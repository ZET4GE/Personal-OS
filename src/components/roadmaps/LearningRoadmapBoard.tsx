'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GripVertical, Plus, Pencil, Save, X, ChevronUp, ChevronDown, Target, ListTodo, Repeat, Clock, CheckCircle2, PlayCircle, Ban } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { LearningRoadmapFlow } from './LearningRoadmapFlow'
import { RoadmapExecutionPanel } from './RoadmapExecutionPanel'
import type { Goal } from '@/types/goals'
import type {
  LearningNodeType,
  LearningNodeStatus,
  LearningRoadmap,
  LearningRoadmapNode,
} from '@/types/roadmaps'

interface LearningRoadmapBoardProps {
  roadmap: LearningRoadmap
  initialNodes: LearningRoadmapNode[]
  availableGoals: Goal[]
}

interface NodeDraft {
  title: string
  description: string
  type: LearningNodeType
  level: string
  parentId: string
  goalIds: string[]
}

const selectClassName = 'w-full rounded-xl border border-border bg-zinc-950 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500 [&>option]:bg-zinc-950 [&>option]:text-white'

const EMPTY_DRAFT: NodeDraft = {
  title: '',
  description: '',
  type: 'topic',
  level: '',
  parentId: '',
  goalIds: [],
}

function getTypeLabel(type: LearningNodeType) {
  return type === 'skill' ? 'Skill' : 'Topic'
}

function getNodeProgress(goals: Goal[]) {
  if (goals.length === 0) return 0
  return goals.reduce((acc, goal) => acc + Number(goal.progress ?? 0), 0) / goals.length
}

function getNextNode(nodes: LearningRoadmapNode[]) {
  return nodes.find((node) => node.status === 'in_progress')
    ?? nodes.find((node) => node.status === 'pending')
    ?? nodes.find((node) => node.progress > 0 && node.progress < 1)
    ?? nodes.find((node) => node.progress < 1 && node.status !== 'blocked')
    ?? nodes.at(-1)
    ?? null
}

function getActionLabel(type: LearningRoadmapNode['actions'][number]['entity_type']) {
  if (type === 'goal') return 'Sub-meta'
  if (type === 'habit') return 'Habito'
  if (type === 'routine') return 'Rutina'
  if (type === 'project') return 'Proyecto'
  return 'Tarea'
}

function getStatusLabel(status: LearningNodeStatus) {
  if (status === 'completed') return 'Completado'
  if (status === 'in_progress') return 'En progreso'
  if (status === 'blocked') return 'Bloqueado'
  return 'Pendiente'
}

function getStatusClass(status: LearningNodeStatus) {
  if (status === 'completed') return 'bg-emerald-500/10 text-emerald-300'
  if (status === 'in_progress') return 'bg-cyan-500/10 text-cyan-300'
  if (status === 'blocked') return 'bg-red-500/10 text-red-300'
  return 'bg-surface text-muted'
}

function buildNode(
  node: Omit<LearningRoadmapNode, 'goals' | 'progress' | 'actions'> & { actions?: LearningRoadmapNode['actions'] },
  goals: Goal[],
): LearningRoadmapNode {
  return {
    ...node,
    goals,
    progress: getNodeProgress(goals) / 100,
    actions: node.actions ?? [],
  }
}

export function LearningRoadmapBoard({
  roadmap,
  initialNodes,
  availableGoals,
}: LearningRoadmapBoardProps) {
  const [nodes, setNodes] = useState(initialNodes)
  const [draft, setDraft] = useState<NodeDraft>(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<NodeDraft>(EMPTY_DRAFT)
  const [isSaving, setIsSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState<LearningNodeStatus | 'all'>('all')
  const supabase = createClient()
  const primaryGoal = availableGoals.find((goal) => goal.id === roadmap.primary_goal_id) ?? null
  const nextNode = getNextNode(nodes)
  const averageProgress = Math.round(nodes.reduce((acc, node) => acc + node.progress, 0) / Math.max(nodes.length, 1) * 100)
  const filteredNodes = statusFilter === 'all'
    ? nodes
    : nodes.filter((node) => node.status === statusFilter)

  async function getUserId() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('Sesion invalida')
    return user.id
  }

  async function linkEntityToPrimaryGoal(entityType: string, entityId: string, userId: string) {
    if (!roadmap.primary_goal_id) return

    const { error } = await supabase.rpc('link_entity_to_goal', {
      p_goal_id: roadmap.primary_goal_id,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_user_id: userId,
    })

    if (error) throw new Error(error.message)
  }

  async function registerNodeAction(
    nodeId: string,
    entityType: 'goal' | 'habit' | 'routine' | 'project' | 'task',
    entityId: string,
  ) {
    const { data, error } = await supabase
      .from('roadmap_node_actions')
      .upsert(
        {
          node_id: nodeId,
          entity_type: entityType,
          entity_id: entityId,
        },
        { onConflict: 'node_id,entity_type,entity_id' },
      )
      .select('*')
      .single()

    if (error || !data) throw new Error(error?.message || 'No se pudo registrar la accion')
    return data as LearningRoadmapNode['actions'][number]
  }

  async function createGoalFromNode(node: LearningRoadmapNode) {
    if (isSaving) return
    setIsSaving(true)

    try {
      const userId = await getUserId()
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: node.title,
          description: node.description || `Sub-meta generada desde el roadmap: ${roadmap.title}`,
          category: roadmap.type === 'goal_based' ? 'learning' : 'personal',
          priority: 'medium',
          color: 'cyan',
          icon: '🎯',
          is_public: false,
        })
        .select('*')
        .single()

      if (error || !data) throw new Error(error?.message || 'No se pudo crear la sub-meta')

      const action = await registerNodeAction(node.id, 'goal', String(data.id))
      await syncNodeGoals(node.id, [data.id, ...node.goals.map((goal) => goal.id)])
      setNodes((current) =>
        current.map((item) =>
          item.id === node.id
            ? buildNode({ ...item, actions: [action, ...item.actions] }, [data as Goal, ...item.goals])
            : item,
        ),
      )
      toast.success('Sub-meta creada y conectada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear la sub-meta')
    } finally {
      setIsSaving(false)
    }
  }

  async function createHabitFromNode(node: LearningRoadmapNode) {
    if (isSaving) return
    setIsSaving(true)

    try {
      const userId = await getUserId()
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: node.title,
          description: node.description || `Habito generado desde el roadmap: ${roadmap.title}`,
          icon: '🎯',
          color: 'teal',
          frequency: 'daily',
          target_days: [1, 2, 3, 4, 5, 6, 0],
          is_active: true,
        })
        .select('id')
        .single()

      if (error || !data) throw new Error(error?.message || 'No se pudo crear el habito')

      const action = await registerNodeAction(node.id, 'habit', String(data.id))
      await linkEntityToPrimaryGoal('habit', String(data.id), userId)
      setNodes((current) =>
        current.map((item) =>
          item.id === node.id
            ? { ...item, actions: [action, ...item.actions] }
            : item,
        ),
      )
      toast.success(roadmap.primary_goal_id ? 'Habito creado y vinculado a la meta' : 'Habito creado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el habito')
    } finally {
      setIsSaving(false)
    }
  }

  async function createRoutineFromNode(node: LearningRoadmapNode) {
    if (isSaving) return
    setIsSaving(true)

    try {
      const userId = await getUserId()
      const { data, error } = await supabase
        .from('routines')
        .insert({
          user_id: userId,
          name: node.title,
          description: node.description || `Rutina generada desde el roadmap: ${roadmap.title}`,
          time_of_day: 'morning',
          estimated_minutes: 30,
          is_active: true,
        })
        .select('id')
        .single()

      if (error || !data) throw new Error(error?.message || 'No se pudo crear la rutina')

      await supabase
        .from('routine_items')
        .insert({
          routine_id: data.id,
          user_id: userId,
          title: `Trabajar en: ${node.title}`,
          duration_minutes: 30,
          order_index: 0,
        })

      const action = await registerNodeAction(node.id, 'routine', String(data.id))
      await linkEntityToPrimaryGoal('routine', String(data.id), userId)
      setNodes((current) =>
        current.map((item) =>
          item.id === node.id
            ? { ...item, actions: [action, ...item.actions] }
            : item,
        ),
      )
      toast.success(roadmap.primary_goal_id ? 'Rutina creada y vinculada a la meta' : 'Rutina creada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear la rutina')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateNodeStatus(nodeId: string, status: LearningNodeStatus) {
    if (isSaving) return
    setIsSaving(true)

    const completedAt = status === 'completed' ? new Date().toISOString() : null
    const previousNodes = nodes

    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              status,
              completed_at: completedAt,
              progress: status === 'completed' ? 1 : node.progress,
            }
          : node,
      ),
    )

    const { error } = await supabase
      .from('learning_nodes')
      .update({
        status,
        completed_at: completedAt,
      })
      .eq('id', nodeId)

    if (error) {
      setNodes(previousNodes)
      toast.error(error.message || 'No se pudo actualizar el estado')
    } else {
      toast.success(`Nodo marcado como ${getStatusLabel(status).toLowerCase()}`)
    }

    setIsSaving(false)
  }

  function handleFlowNodesChange(updatedNodes: LearningRoadmapNode[]) {
    const updatedMap = new Map(updatedNodes.map((node) => [node.id, node]))
    setNodes((current) => current.map((node) => updatedMap.get(node.id) ?? node))
  }

  async function syncNodeGoals(nodeId: string, goalIds: string[]) {
    const { error: deleteError } = await supabase
      .from('learning_node_goals')
      .delete()
      .eq('node_id', nodeId)

    if (deleteError) throw deleteError

    if (goalIds.length === 0) return

    const payload = goalIds.map((goalId) => ({
      node_id: nodeId,
      goal_id: goalId,
    }))

    const { error: insertError } = await supabase
      .from('learning_node_goals')
      .insert(payload)

    if (insertError) throw insertError
  }

  async function handleCreateNode() {
    if (!draft.title.trim() || isSaving) return
    setIsSaving(true)

    const nextPosition = nodes.length === 0
      ? 0
      : Math.max(...nodes.map((node) => node.position)) + 1

    const { data, error } = await supabase
      .from('learning_nodes')
      .insert({
        roadmap_id: roadmap.id,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        type: draft.type,
        level: roadmap.type === 'free' ? null : draft.level.trim() || 'Fundamentos',
        parent_id: draft.parentId || null,
        status: 'pending',
        position: nextPosition,
      })
      .select('*')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'No se pudo crear el nodo')
      setIsSaving(false)
      return
    }

    try {
      await syncNodeGoals(String(data.id), draft.goalIds)
    } catch (linkError) {
      toast.error(linkError instanceof Error ? linkError.message : 'No se pudo vincular la meta')
    }

    const linkedGoals = availableGoals.filter((goal) => draft.goalIds.includes(goal.id))
    setNodes((current) => [
      ...current,
      buildNode(
        {
          ...data,
          id: String(data.id),
          roadmap_id: String(data.roadmap_id),
          description: data.description ?? null,
          type: data.type as LearningNodeType,
          level: data.level ?? null,
          status: data.status as LearningNodeStatus,
          completed_at: data.completed_at ?? null,
          parent_id: data.parent_id ?? null,
          position_x: data.position_x ?? null,
          position_y: data.position_y ?? null,
        },
        linkedGoals,
      ),
    ])
    setDraft(EMPTY_DRAFT)
    setIsSaving(false)
    toast.success('Nodo creado')
  }

  function startEdit(node: LearningRoadmapNode) {
    setEditingId(node.id)
    setEditDraft({
      title: node.title,
      description: node.description ?? '',
      type: node.type,
      level: node.level ?? '',
      parentId: node.parent_id ?? '',
      goalIds: node.goals.map((goal) => goal.id),
    })
  }

  async function handleSaveEdit(nodeId: string) {
    if (!editDraft.title.trim() || isSaving) return
    setIsSaving(true)

    const { data, error } = await supabase
      .from('learning_nodes')
      .update({
        title: editDraft.title.trim(),
        description: editDraft.description.trim() || null,
        type: editDraft.type,
        level: roadmap.type === 'free' ? null : editDraft.level.trim() || 'Fundamentos',
        parent_id: editDraft.parentId || null,
      })
      .eq('id', nodeId)
      .select('*')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'No se pudo guardar el nodo')
      setIsSaving(false)
      return
    }

    try {
      await syncNodeGoals(nodeId, editDraft.goalIds)
    } catch (linkError) {
      toast.error(linkError instanceof Error ? linkError.message : 'No se pudo actualizar la meta')
    }

    const linkedGoals = availableGoals.filter((goal) => editDraft.goalIds.includes(goal.id))

    setNodes((current) =>
      current.map((node) =>
        node.id === nodeId
          ? buildNode(
              {
                ...node,
                ...data,
                id: String(data.id),
                roadmap_id: String(data.roadmap_id),
                description: data.description ?? null,
                type: data.type as LearningNodeType,
                level: data.level ?? null,
                status: data.status as LearningNodeStatus,
                completed_at: data.completed_at ?? null,
                parent_id: data.parent_id ?? null,
                position_x: data.position_x ?? null,
                position_y: data.position_y ?? null,
              },
              linkedGoals,
            )
          : node,
      ),
    )

    setEditingId(null)
    setIsSaving(false)
    toast.success('Nodo actualizado')
  }

  async function moveNode(nodeId: string, direction: -1 | 1) {
    const index = nodes.findIndex((node) => node.id === nodeId)
    const targetIndex = index + direction
    if (index < 0 || targetIndex < 0 || targetIndex >= nodes.length || isSaving) return

    const reordered = [...nodes]
    const [item] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, item)

    const withPositions = reordered.map((node, idx) => ({
      ...node,
      position: idx,
    }))

    setNodes(withPositions)
    setIsSaving(true)

    const payload = withPositions.map((node) => ({
      id: node.id,
      position: node.position,
    }))

    const { error } = await supabase.from('learning_nodes').upsert(payload)

    if (error) {
      toast.error(error.message || 'No se pudo reordenar')
      setNodes(nodes)
    }

    setIsSaving(false)
  }

  function toggleGoal(goalId: string, mode: 'create' | 'edit') {
    const setter = mode === 'create' ? setDraft : setEditDraft
    setter((current) => ({
      ...current,
      goalIds: current.goalIds.includes(goalId)
        ? current.goalIds.filter((item) => item !== goalId)
        : [...current.goalIds, goalId],
    }))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                {roadmap.type === 'free'
                  ? 'Roadmap libre'
                  : roadmap.type === 'structured'
                  ? 'Plan estructurado'
                  : 'Roadmap basado en metas'}
              </span>
              {roadmap.is_public ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
                  Publico
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">{roadmap.title}</h1>
            {roadmap.description ? (
              <p className="max-w-3xl text-sm leading-6 text-muted">{roadmap.description}</p>
            ) : null}
            <p className="max-w-3xl text-xs leading-5 text-muted">
              {roadmap.type === 'free'
                ? 'Libre: usa el canvas como mapa mental. Las conexiones son manuales y no hay orden obligatorio.'
                : roadmap.type === 'structured'
                ? 'Plan de estudio: los nodos se ordenan por niveles y las conexiones marcan prerequisitos.'
                : 'Basado en metas: funciona como plan guiado y el progreso se calcula desde las metas conectadas.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface-2 p-2 text-center">
            <div className="rounded-lg bg-surface px-3 py-2">
              <p className="text-lg font-semibold text-text">{nodes.length}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Nodos</p>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2">
              <p className="text-lg font-semibold text-text">
                {nodes.filter((node) => node.goals.length > 0).length}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Con metas</p>
            </div>
            <div className="rounded-lg bg-surface px-3 py-2">
              <p className="text-lg font-semibold text-text">{averageProgress}%</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Promedio</p>
            </div>
          </div>
        </div>
      </section>

      <RoadmapExecutionPanel
        roadmap={roadmap}
        nodes={nodes}
        primaryGoal={primaryGoal}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} className="text-cyan-300" />
            <h2 className="text-sm font-semibold text-cyan-100">Meta que guia este roadmap</h2>
          </div>
          <p className="text-lg font-semibold text-text">{primaryGoal?.title ?? 'Sin meta principal'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {primaryGoal
              ? 'Todo nodo conectado a esta meta puede alimentar progreso, habitos, rutinas y tiempo.'
              : 'Asigna una meta principal desde la lista de roadmaps para convertir este mapa en un plan accionable.'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Siguiente accion recomendada</h2>
              <p className="text-xs text-muted">El roadmap debe llevarte a ejecutar, no solo a ordenar ideas.</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">{averageProgress}% total</span>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <p className="text-sm font-semibold text-text">{nextNode?.title ?? 'Crea el primer nodo'}</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {nextNode?.description ?? 'Define el primer paso del camino y conectalo con una meta.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => nextNode && createGoalFromNode(nextNode)}
                disabled={!nextNode || isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Target size={13} />
                Crear sub-meta
              </button>
              <button
                type="button"
                onClick={() => nextNode && createHabitFromNode(nextNode)}
                disabled={!nextNode || isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ListTodo size={13} />
                Crear habito
              </button>
              <button
                type="button"
                onClick={() => nextNode && createRoutineFromNode(nextNode)}
                disabled={!nextNode || isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Repeat size={13} />
                Crear rutina
              </button>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted transition-colors hover:text-text">
                <Clock size={13} />
                Registrar tiempo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={16} className="text-cyan-400" />
          <h2 className="text-sm font-semibold text-text">Nuevo nodo</h2>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Titulo del nodo"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
            />
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Que vas a aprender o practicar"
              rows={3}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
            />
            <select
              value={draft.type}
              onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as LearningNodeType }))}
              className={selectClassName}
            >
              <option value="topic">Topic</option>
              <option value="skill">Skill</option>
            </select>
            {roadmap.type !== 'free' ? (
              <input
                value={draft.level}
                onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value }))}
                placeholder="Nivel o seccion. Ej: Fundamentos"
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
              />
            ) : null}
            <select
              value={draft.parentId}
              onChange={(event) => setDraft((current) => ({ ...current, parentId: event.target.value }))}
              className={selectClassName}
            >
              <option value="">Sin conexion previa</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  Conectar despues de: {node.title}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Metas conectadas
            </p>
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {availableGoals.map((goal) => (
                <label
                  key={goal.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text transition-colors hover:bg-surface"
                >
                  <input
                    type="checkbox"
                    checked={draft.goalIds.includes(goal.id)}
                    onChange={() => toggleGoal(goal.id, 'create')}
                    className="h-4 w-4 rounded border-border bg-transparent"
                  />
                  <span className="truncate">{goal.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateNode}
          disabled={isSaving || !draft.title.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={14} />
          {isSaving ? 'Guardando...' : 'Crear nodo'}
        </button>
      </section>

      <LearningRoadmapFlow nodes={filteredNodes} roadmapType={roadmap.type} onNodesChange={handleFlowNodesChange} />

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Editor de nodos</h2>
            <p className="text-xs text-muted">Gestiona contenido, metas y orden del roadmap</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredNodes.map((node, index) => {
            const isEditing = editingId === node.id
            const progress = Math.round(node.progress * 100)
            const currentDraft = isEditing ? editDraft : null

            return (
              <div key={node.id} className="relative pl-8">
                {index < nodes.length - 1 ? (
                  <div className="absolute left-[14px] top-8 h-[calc(100%+12px)] w-px bg-border" />
                ) : null}
                <div className="absolute left-0 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <GripVertical size={14} />
                </div>

                <div className="rounded-2xl border border-border bg-surface-2 p-4 transition-all hover:border-border-bright hover:shadow-[var(--shadow-card)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      {isEditing && currentDraft ? (
                        <div className="space-y-3">
                          <input
                            value={currentDraft.title}
                            onChange={(event) => setEditDraft((draftState) => ({ ...draftState, title: event.target.value }))}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
                          />
                          <textarea
                            value={currentDraft.description}
                            onChange={(event) => setEditDraft((draftState) => ({ ...draftState, description: event.target.value }))}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
                          />
                          <select
                            value={currentDraft.type}
                            onChange={(event) => setEditDraft((draftState) => ({ ...draftState, type: event.target.value as LearningNodeType }))}
                            className={selectClassName}
                          >
                            <option value="topic">Topic</option>
                            <option value="skill">Skill</option>
                          </select>
                          {roadmap.type !== 'free' ? (
                            <input
                              value={currentDraft.level}
                              onChange={(event) => setEditDraft((draftState) => ({ ...draftState, level: event.target.value }))}
                              placeholder="Nivel o seccion"
                              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
                            />
                          ) : null}
                          <select
                            value={currentDraft.parentId}
                            onChange={(event) => setEditDraft((draftState) => ({ ...draftState, parentId: event.target.value }))}
                            className={selectClassName}
                          >
                            <option value="">Sin conexion previa</option>
                      {nodes
                              .filter((candidate) => candidate.id !== node.id)
                              .map((candidate) => (
                                <option key={candidate.id} value={candidate.id}>
                                  Conectar despues de: {candidate.title}
                                </option>
                              ))}
                          </select>
                          <div className="grid gap-2 rounded-xl border border-border bg-surface p-3 md:grid-cols-2">
                            {availableGoals.map((goal) => (
                              <label
                                key={goal.id}
                                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text transition-colors hover:bg-surface-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={currentDraft.goalIds.includes(goal.id)}
                                  onChange={() => toggleGoal(goal.id, 'edit')}
                                  className="h-4 w-4 rounded border-border bg-transparent"
                                />
                                <span className="truncate">{goal.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-text">{node.title}</h3>
                            <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-400">
                              {getTypeLabel(node.type)}
                            </span>
                            {node.level ? (
                              <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-medium text-muted">
                                {node.level}
                              </span>
                            ) : null}
                            <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClass(node.status)}`}>
                              {getStatusLabel(node.status)}
                            </span>
                          </div>
                          {node.description ? (
                            <p className="text-sm leading-6 text-muted">{node.description}</p>
                          ) : null}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span>Progreso</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-surface">
                              <div
                                className="h-full rounded-full bg-cyan-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {node.goals.length > 0 ? (
                              node.goals.map((goal) => (
                                <div
                                  key={goal.id}
                                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text"
                                >
                                  <Target size={11} className="text-cyan-400" />
                                  <span>{goal.title}</span>
                                  <span className="text-muted">{Math.round(goal.progress)}%</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted">Sin metas conectadas</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                            <button
                              type="button"
                              onClick={() => updateNodeStatus(node.id, 'in_progress')}
                              disabled={isSaving || node.status === 'in_progress'}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-300 transition-colors hover:bg-cyan-500/15 disabled:opacity-50"
                            >
                              <PlayCircle size={12} />
                              Iniciar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateNodeStatus(node.id, 'completed')}
                              disabled={isSaving || node.status === 'completed'}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
                            >
                              <CheckCircle2 size={12} />
                              Completar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateNodeStatus(node.id, 'blocked')}
                              disabled={isSaving || node.status === 'blocked'}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                            >
                              <Ban size={12} />
                              Bloquear
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => createGoalFromNode(node)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-300 transition-colors hover:bg-cyan-500/15 disabled:opacity-50"
                            >
                              <Target size={12} />
                              Sub-meta
                            </button>
                            <button
                              type="button"
                              onClick={() => createHabitFromNode(node)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-text disabled:opacity-50"
                            >
                              <ListTodo size={12} />
                              Habito
                            </button>
                            <button
                              type="button"
                              onClick={() => createRoutineFromNode(node)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-text disabled:opacity-50"
                            >
                              <Repeat size={12} />
                              Rutina
                            </button>
                          </div>
                          <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                              Acciones creadas desde este nodo
                            </p>
                            {node.actions.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {node.actions.map((action) => (
                                  <span
                                    key={action.id}
                                    className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-text"
                                  >
                                    {getActionLabel(action.entity_type)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted">
                                Todavia no generaste sub-metas, habitos o rutinas desde este nodo.
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-start">
                      <button
                        type="button"
                        onClick={() => moveNode(node.id, -1)}
                        disabled={index === 0 || isSaving}
                        className="rounded-lg border border-border bg-surface px-2 py-2 text-muted transition-colors hover:text-text disabled:opacity-40"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveNode(node.id, 1)}
                        disabled={index === filteredNodes.length - 1 || isSaving}
                        className="rounded-lg border border-border bg-surface px-2 py-2 text-muted transition-colors hover:text-text disabled:opacity-40"
                      >
                        <ChevronDown size={14} />
                      </button>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(node.id)}
                            disabled={isSaving || !editDraft.title.trim()}
                            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-400 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-border bg-surface px-3 py-2 text-muted transition-colors hover:text-text"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(node)}
                          className="rounded-lg border border-border bg-surface px-3 py-2 text-muted transition-colors hover:text-text"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredNodes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-2 px-5 py-12 text-center">
              <p className="text-sm font-medium text-text">No hay nodos para este filtro</p>
              <p className="mt-1 text-sm text-muted">Cambia el filtro o agrega un nuevo nodo.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
