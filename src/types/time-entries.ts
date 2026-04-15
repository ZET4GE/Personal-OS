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

export type TimerMode = 'tracking' | 'countdown'

export interface TimerPosition {
  x: number
  y: number
}

export interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedTime: number
  mode: TimerMode
  minimized: boolean
  hidden: boolean
  position: TimerPosition
  countdownMinutes: number
  countdownDuration: number
  finishedAt: number | null
}

export interface TimerTargetOption {
  id: string
  label: string
}
