import type { SupabaseClient } from '@supabase/supabase-js'
import type { Goal } from '@/types/goals'
import type {
  LearningNode,
  LearningNodeGoalLink,
  LearningRoadmap,
  LearningRoadmapDetail,
  LearningRoadmapNode,
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

    const progress = linkedGoals.length === 0
      ? 0
      : linkedGoals.reduce((acc, goal) => acc + Number(goal.progress ?? 0), 0) / linkedGoals.length / 100

    return {
      ...node,
      goals: linkedGoals,
      progress,
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
