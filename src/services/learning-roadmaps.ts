import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal } from '@/types/goals'
import type {
  LearningNode,
  LearningNodeStatus,
  LearningNodeGoalLink,
  LearningRoadmap,
  LearningRoadmapDetail,
  LearningRoadmapNode,
  RoadmapNodeAction,
} from '@/types/roadmaps'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

function sortNodes(nodes: LearningRoadmapNode[]) {
  return [...nodes].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
}

export async function getLearningRoadmapDetail(
  supabase: SupabaseClient,
  roadmapId: string,
  userId: string,
): Promise<Result<LearningRoadmapDetail>> {
  const { data: roadmap, error: roadmapError } = await supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('id', roadmapId)
    .eq('user_id', userId)
    .maybeSingle()

  if (roadmapError) return err(roadmapError.message)
  if (!roadmap) return err('Roadmap no encontrado')

  const { data: nodes, error: nodesError } = await supabase
    .from('learning_nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (nodesError) return err(nodesError.message)

  const nodeIds = (nodes ?? []).map((node) => String(node.id))

  const [linksRes, actionsRes, progressRes, goalsRes] = await Promise.all([
    nodeIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('learning_node_goals')
          .select('*')
          .in('node_id', nodeIds),
    nodeIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('roadmap_node_actions')
          .select('*')
          .in('node_id', nodeIds)
          .order('created_at', { ascending: false }),
    Promise.all(
      nodeIds.map(async (nodeId) => {
        const { data, error } = await supabase.rpc('get_roadmap_node_progress', { p_node_id: nodeId })
        return { nodeId, progress: Number(data ?? 0), error }
      }),
    ),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  if (linksRes.error) return err(linksRes.error.message)
  if (actionsRes.error) return err(actionsRes.error.message)
  if (goalsRes.error) return err(goalsRes.error.message)

  const progressError = progressRes.find((item) => item.error)
  if (progressError?.error) return err(progressError.error.message)

  const availableGoals = (goalsRes.data ?? []) as Goal[]
  const goalsById = new Map(availableGoals.map((goal) => [goal.id, goal]))
  const linksByNodeId = new Map<string, LearningNodeGoalLink[]>()
  const actionsByNodeId = new Map<string, RoadmapNodeAction[]>()
  const progressByNodeId = new Map(progressRes.map((item) => [item.nodeId, item.progress]))

  for (const link of (linksRes.data ?? []) as LearningNodeGoalLink[]) {
    const current = linksByNodeId.get(link.node_id) ?? []
    current.push(link)
    linksByNodeId.set(link.node_id, current)
  }

  for (const action of (actionsRes.data ?? []) as RoadmapNodeAction[]) {
    const current = actionsByNodeId.get(action.node_id) ?? []
    current.push(action)
    actionsByNodeId.set(action.node_id, current)
  }

  const hydratedNodes: LearningRoadmapNode[] = ((nodes ?? []) as LearningNode[]).map((node) => {
    const linkedGoals = (linksByNodeId.get(node.id) ?? [])
      .map((link) => goalsById.get(link.goal_id))
      .filter((goal): goal is Goal => Boolean(goal))

    const status = (node.status ?? 'pending') as LearningNodeStatus
    const fallbackProgress = linkedGoals.length === 0
      ? 0
      : linkedGoals.reduce((acc, goal) => acc + Number(goal.progress ?? 0), 0) / linkedGoals.length / 100
    const progress = status === 'completed'
      ? 1
      : progressByNodeId.get(node.id) ?? fallbackProgress

    return {
      ...node,
      status,
      completed_at: node.completed_at ?? null,
      goals: linkedGoals,
      progress,
      actions: actionsByNodeId.get(node.id) ?? [],
    }
  })

  return ok({
    roadmap: roadmap as LearningRoadmap,
    nodes: sortNodes(hydratedNodes),
    availableGoals,
  })
}

export async function getLearningRoadmaps(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<LearningRoadmap[]>> {
  const { data, error } = await supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return err(error.message)

  return ok((data ?? []) as LearningRoadmap[])
}

export type RoadmapNodeSummary = Record<string, { total: number; completed: number }>

export async function getLearningRoadmapNodeSummary(
  supabase: SupabaseClient,
  roadmapIds: string[],
): Promise<Result<RoadmapNodeSummary>> {
  if (roadmapIds.length === 0) return ok({})

  const { data, error } = await supabase
    .from('learning_nodes')
    .select('roadmap_id, status')
    .in('roadmap_id', roadmapIds)

  if (error) return err(error.message)

  const summary: RoadmapNodeSummary = {}
  for (const row of (data ?? []) as { roadmap_id: string; status: string }[]) {
    const current = summary[row.roadmap_id] ?? { total: 0, completed: 0 }
    current.total++
    if (row.status === 'completed') current.completed++
    summary[row.roadmap_id] = current
  }

  return ok(summary)
}

export async function getRoadmapsByGoalId(
  supabase: SupabaseClient,
  userId: string,
  goalId: string,
): Promise<Result<LearningRoadmap[]>> {
  const { data, error } = await supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('user_id', userId)
    .eq('primary_goal_id', goalId)
    .order('created_at', { ascending: false })

  if (error) return err(error.message)
  return ok((data ?? []) as LearningRoadmap[])
}

export async function getPublicLearningRoadmapsByUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<LearningRoadmap[]>> {
  const { data, error } = await supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) return err(error.message)

  return ok((data ?? []) as LearningRoadmap[])
}

export async function getPublicLearningRoadmapDetail(
  supabase: SupabaseClient,
  roadmapId: string,
  userId: string,
): Promise<Result<LearningRoadmapDetail>> {
  const { data: roadmap, error: roadmapError } = await supabase
    .from('learning_roadmaps')
    .select('*')
    .eq('id', roadmapId)
    .eq('user_id', userId)
    .eq('is_public', true)
    .maybeSingle()

  if (roadmapError) return err(roadmapError.message)
  if (!roadmap) return err('Roadmap no encontrado')

  const { data: nodes, error: nodesError } = await supabase
    .from('learning_nodes')
    .select('*')
    .eq('roadmap_id', roadmapId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (nodesError) return err(nodesError.message)

  const nodeIds = (nodes ?? []).map((node) => String(node.id))

  const [linksRes, goalsRes] = await Promise.all([
    nodeIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from('learning_node_goals')
          .select('*')
          .in('node_id', nodeIds),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false }),
  ])

  if (linksRes.error) return err(linksRes.error.message)
  if (goalsRes.error) return err(goalsRes.error.message)

  const availableGoals = (goalsRes.data ?? []) as Goal[]
  const goalsById = new Map(availableGoals.map((goal) => [goal.id, goal]))
  const linksByNodeId = new Map<string, LearningNodeGoalLink[]>()

  for (const link of (linksRes.data ?? []) as LearningNodeGoalLink[]) {
    const current = linksByNodeId.get(link.node_id) ?? []
    current.push(link)
    linksByNodeId.set(link.node_id, current)
  }

  const hydratedNodes: LearningRoadmapNode[] = ((nodes ?? []) as LearningNode[]).map((node) => {
    const linkedGoals = (linksByNodeId.get(node.id) ?? [])
      .map((link) => goalsById.get(link.goal_id))
      .filter((goal): goal is Goal => Boolean(goal))

    const status = (node.status ?? 'pending') as LearningNodeStatus
    const fallbackProgress = linkedGoals.length === 0
      ? 0
      : linkedGoals.reduce((acc, goal) => acc + Number(goal.progress ?? 0), 0) / linkedGoals.length / 100

    return {
      ...node,
      status,
      completed_at: node.completed_at ?? null,
      goals: linkedGoals,
      progress: status === 'completed' ? 1 : fallbackProgress,
      actions: [],
    }
  })

  return ok({
    roadmap: roadmap as LearningRoadmap,
    nodes: sortNodes(hydratedNodes),
    availableGoals,
  })
}
