// ─────────────────────────────────────────────────────────────
// Enums / constants
// ─────────────────────────────────────────────────────────────

export const GOAL_CATEGORIES = [
  'personal', 'career', 'health', 'financial', 'learning', 'other',
] as const

export const GOAL_STATUSES = [
  'active', 'completed', 'paused', 'abandoned',
] as const

export const GOAL_PRIORITIES = [
  'low', 'medium', 'high',
] as const

export const GOAL_MOODS = [
  'great', 'good', 'okay', 'struggling',
] as const

export const GOAL_COLORS = [
  'blue', 'green', 'amber', 'purple', 'red', 'pink', 'cyan', 'orange',
] as const

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]
export type GoalStatus   = (typeof GOAL_STATUSES)[number]
export type GoalPriority = (typeof GOAL_PRIORITIES)[number]
export type GoalMood     = (typeof GOAL_MOODS)[number]
export type GoalColor    = (typeof GOAL_COLORS)[number]

// ─────────────────────────────────────────────────────────────
// Color + category style maps
// ─────────────────────────────────────────────────────────────

export const GOAL_COLOR_STYLES: Record<GoalColor, { bar: string; badge: string; ring: string; text: string }> = {
  blue:   { bar: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',    ring: 'ring-blue-500/30',    text: 'text-blue-500'    },
  green:  { bar: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30', text: 'text-emerald-500' },
  amber:  { bar: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',  ring: 'ring-amber-500/30',   text: 'text-amber-500'   },
  purple: { bar: 'bg-violet-500',  badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/30',  text: 'text-violet-500'  },
  red:    { bar: 'bg-red-500',     badge: 'bg-red-500/10 text-red-600 dark:text-red-400',        ring: 'ring-red-500/30',     text: 'text-red-500'     },
  pink:   { bar: 'bg-pink-500',    badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',     ring: 'ring-pink-500/30',    text: 'text-pink-500'    },
  cyan:   { bar: 'bg-cyan-500',    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',     ring: 'ring-cyan-500/30',    text: 'text-cyan-500'    },
  orange: { bar: 'bg-orange-500',  badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/30',  text: 'text-orange-500'  },
}

export const CATEGORY_META: Record<GoalCategory, { icon: string; label: string; color: string }> = {
  personal:  { icon: '🌟', label: 'Personal',   color: 'purple' },
  career:    { icon: '💼', label: 'Carrera',     color: 'blue'   },
  health:    { icon: '💪', label: 'Salud',       color: 'green'  },
  financial: { icon: '💰', label: 'Financiero',  color: 'amber'  },
  learning:  { icon: '📚', label: 'Aprendizaje', color: 'cyan'   },
  other:     { icon: '🎯', label: 'Otro',        color: 'orange' },
}

export const PRIORITY_META: Record<GoalPriority, { label: string; color: string }> = {
  low:    { label: 'Baja',  color: 'text-muted' },
  medium: { label: 'Media', color: 'text-amber-500' },
  high:   { label: 'Alta',  color: 'text-red-500' },
}

export const MOOD_META: Record<GoalMood, { emoji: string; label: string }> = {
  great:     { emoji: '🚀', label: 'Excelente' },
  good:      { emoji: '😊', label: 'Bien' },
  okay:      { emoji: '😐', label: 'Regular' },
  struggling:{ emoji: '😓', label: 'Con dificultades' },
}

// ─────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────

export interface Goal {
  id:           string
  user_id:      string
  title:        string
  description:  string | null
  category:     GoalCategory
  status:       GoalStatus
  priority:     GoalPriority
  target_date:  string | null
  completed_at: string | null
  progress:     number
  icon:         string | null
  color:        GoalColor
  is_public:    boolean
  target_time:  number | null
  current_time: number
  order_index:  number
  created_at:   string
  updated_at:   string
}

export interface Milestone {
  id:           string
  goal_id:      string
  user_id:      string
  title:        string
  description:  string | null
  is_completed: boolean
  completed_at: string | null
  target_date:  string | null
  order_index:  number
  created_at:   string
}

export interface GoalUpdate {
  id:         string
  goal_id:    string
  user_id:    string
  content:    string
  mood:       GoalMood | null
  created_at: string
}

export interface GoalWithMilestones extends Goal {
  milestones:   Milestone[]
  goal_updates: GoalUpdate[]
}

export interface GoalStats {
  total:       number
  active:      number
  completed:   number
  paused:      number
  avgProgress: number
}

// ─────────────────────────────────────────────────────────────
// Action results
// ─────────────────────────────────────────────────────────────

export type GoalActionResult =
  | { success: true;  goal: Goal }
  | { success: false; error: string }

export type MilestoneActionResult =
  | { success: true;  milestone: Milestone }
  | { success: false; error: string }

export type GoalUpdateActionResult =
  | { success: true;  update: GoalUpdate }
  | { success: false; error: string }

export type DeleteActionResult =
  | { success: true }
  | { success: false; error: string }
