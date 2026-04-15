export interface TimeEntry {
  id: string
  user_id: string
  project_id: string | null
  goal_id: string | null
  description: string | null
  started_at: string
  ended_at: string | null
  duration: number | null
  created_at: string
}

export interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedTime: number
}

export interface TimerTargetOption {
  id: string
  label: string
}

