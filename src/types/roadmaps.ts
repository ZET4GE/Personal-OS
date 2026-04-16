import type { Goal } from '@/types/goals'

export type LearningNodeType = 'skill' | 'topic'
export type LearningRoadmapType = 'free' | 'structured' | 'goal_based'

export interface LearningRoadmap {
  id: string
  user_id: string
  title: string
  description: string | null
  type: LearningRoadmapType
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
  position: number
  created_at: string
}

export interface LearningNodeGoalLink {
  id: string
  node_id: string
  goal_id: string
}

export interface LearningRoadmapNode extends LearningNode {
  goals: Goal[]
  progress: number
}

export interface LearningRoadmapDetail {
  roadmap: LearningRoadmap
  nodes: LearningRoadmapNode[]
  availableGoals: Goal[]
}
