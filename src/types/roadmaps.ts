import type { Goal } from '@/types/goals'

export type LearningNodeType = 'skill' | 'topic'
export type LearningRoadmapType = 'free' | 'structured' | 'goal_based'
export type LearningRoadmapTemplate = 'blank' | 'skill' | 'project' | 'clients' | 'career'
export type LearningNodeStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export interface LearningRoadmap {
  id: string
  user_id: string
  title: string
  description: string | null
  type: LearningRoadmapType
  primary_goal_id: string | null
  template: LearningRoadmapTemplate
  is_public: boolean
  created_at: string
}

export interface LearningNode {
  id: string
  roadmap_id: string
  parent_id?: string | null
  title: string
  description: string | null
  type: LearningNodeType
  level: string | null
  status: LearningNodeStatus
  completed_at: string | null
  position_x: number | null
  position_y: number | null
  position: number
  created_at: string
}

export interface LearningNodeGoalLink {
  id: string
  node_id: string
  goal_id: string
}

export interface RoadmapNodeAction {
  id: string
  node_id: string
  entity_type: 'goal' | 'habit' | 'routine' | 'project' | 'task'
  entity_id: string
  created_at: string
}

export interface LearningRoadmapNode extends LearningNode {
  goals: Goal[]
  progress: number
  actions: RoadmapNodeAction[]
}

export interface LearningRoadmapDetail {
  roadmap: LearningRoadmap
  nodes: LearningRoadmapNode[]
  availableGoals: Goal[]
}
