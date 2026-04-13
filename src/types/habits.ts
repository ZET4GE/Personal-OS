// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export const FREQUENCIES = ['daily', 'weekdays', 'weekly'] as const
export type Frequency = (typeof FREQUENCIES)[number]

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily:    'Todos los días',
  weekdays: 'Días de semana',
  weekly:   'Semanal',
}

export const TIMES_OF_DAY = ['morning', 'afternoon', 'evening', 'anytime'] as const
export type TimeOfDay = (typeof TIMES_OF_DAY)[number]

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  evening:   'Noche',
  anytime:   'En cualquier momento',
}

export const TIME_OF_DAY_EMOJI: Record<TimeOfDay, string> = {
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌙',
  anytime:   '⏱️',
}

export const HABIT_COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'pink', 'teal', 'amber'] as const
export type HabitColor = (typeof HABIT_COLORS)[number]

export const HABIT_COLOR_STYLES: Record<HabitColor, { bg: string; text: string; ring: string }> = {
  blue:   { bg: 'bg-blue-500',   text: 'text-blue-600   dark:text-blue-400',   ring: 'ring-blue-500/40'   },
  green:  { bg: 'bg-green-500',  text: 'text-green-600  dark:text-green-400',  ring: 'ring-green-500/40'  },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/40' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/40' },
  red:    { bg: 'bg-red-500',    text: 'text-red-600    dark:text-red-400',    ring: 'ring-red-500/40'    },
  pink:   { bg: 'bg-pink-500',   text: 'text-pink-600   dark:text-pink-400',   ring: 'ring-pink-500/40'   },
  teal:   { bg: 'bg-teal-500',   text: 'text-teal-600   dark:text-teal-400',   ring: 'ring-teal-500/40'   },
  amber:  { bg: 'bg-amber-500',  text: 'text-amber-600  dark:text-amber-400',  ring: 'ring-amber-500/40'  },
}

export const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ─────────────────────────────────────────────────────────────
// Core entities (espejo de tablas SQL)
// ─────────────────────────────────────────────────────────────

export interface Habit {
  id:            string
  user_id:       string
  name:          string
  description:   string | null
  icon:          string | null
  color:         HabitColor
  frequency:     Frequency
  target_days:   number[]        // 0=Dom, 1=Lun, ..., 6=Sáb
  reminder_time: string | null   // 'HH:MM'
  is_active:     boolean
  order_index:   number
  created_at:    string
}

export interface HabitLog {
  id:           string
  habit_id:     string
  user_id:      string
  completed_at: string   // 'YYYY-MM-DD'
  notes:        string | null
}

export interface Routine {
  id:                string
  user_id:           string
  name:              string
  description:       string | null
  time_of_day:       TimeOfDay
  estimated_minutes: number | null
  is_active:         boolean
  order_index:       number
  created_at:        string
}

export interface RoutineItem {
  id:               string
  routine_id:       string
  user_id:          string
  title:            string
  duration_minutes: number | null
  order_index:      number
}

export interface RoutineLog {
  id:              string
  routine_id:      string
  user_id:         string
  completed_at:    string   // 'YYYY-MM-DD'
  started_at:      string | null
  finished_at:     string | null
  completed_items: string[]  // UUIDs of completed RoutineItems
}

// ─────────────────────────────────────────────────────────────
// Composed/computed types
// ─────────────────────────────────────────────────────────────

/** Day entry for mini calendar (last 7 days) */
export interface HabitDay {
  date:      string   // 'YYYY-MM-DD'
  completed: boolean
  isDue:     boolean  // was this habit expected on this day?
}

/** Habit enriched with daily context */
export interface HabitWithLogs {
  habit:          Habit
  todayCompleted: boolean
  recentDays:     HabitDay[]   // 7 entries: today + 6 past days
  streak:         number
}

/** Routine enriched with today's log */
export interface RoutineWithStatus {
  routine:         Routine
  items:           RoutineItem[]
  log:             RoutineLog | null
  completedCount:  number
  totalItems:      number
  isCompleted:     boolean
}

// ─────────────────────────────────────────────────────────────
// Action results
// ─────────────────────────────────────────────────────────────

export type HabitActionResult =
  | { error: string }
  | { ok: true }
  | { habit: Habit; error?: never }

export type HabitLogActionResult =
  | { error: string }
  | { completed: boolean; logId: string | null }

export type RoutineActionResult =
  | { error: string }
  | { ok: true }
  | { routine: Routine; error?: never }

export type RoutineLogActionResult =
  | { error: string }
  | { log: RoutineLog }
