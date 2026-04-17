import { createClient } from '@/lib/supabase/server'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> {
  return { data, error: null }
}

function err(message: string): Err {
  return { data: null, error: message }
}

interface TimeEntryRow {
  id: string
  project_id: string | null
  goal_id: string | null
  description: string | null
  duration: number | null
  started_at: string
  ended_at: string | null
}

interface NamedEntity {
  id: string
  title: string
}

export interface TimeStatsBreakdownItem {
  id: string
  title: string
  totalSeconds: number
  sessions: number
}

export interface TimeStatsDailyItem {
  date: string
  label: string
  totalSeconds: number
}

export interface TimeStatsSessionItem {
  id: string
  description: string | null
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  projectTitle: string | null
  goalTitle: string | null
}

export interface TimeStats {
  todaySeconds: number
  weekSeconds: number
  totalSeconds: number
  sessionCount: number
  averageSessionSeconds: number
  unassignedSeconds: number
  daily: TimeStatsDailyItem[]
  byProject: TimeStatsBreakdownItem[]
  byGoal: TimeStatsBreakdownItem[]
  recentSessions: TimeStatsSessionItem[]
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + diff)
  return start
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function getLastDays(days: number, now = new Date()): TimeStatsDailyItem[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - index - 1))

    return {
      date: toDateKey(date),
      label: date.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', ''),
      totalSeconds: 0,
    }
  })
}

function buildBreakdown(
  ids: string[],
  entries: TimeEntryRow[],
  key: 'project_id' | 'goal_id',
  entities: NamedEntity[],
): TimeStatsBreakdownItem[] {
  const totals = new Map<string, { totalSeconds: number; sessions: number }>()

  for (const entry of entries) {
    const entityId = entry[key]
    const duration = entry.duration ?? 0
    if (!entityId || duration <= 0) continue
    const current = totals.get(entityId) ?? { totalSeconds: 0, sessions: 0 }
    totals.set(entityId, {
      totalSeconds: current.totalSeconds + duration,
      sessions: current.sessions + 1,
    })
  }

  const labels = new Map(entities.map((entity) => [entity.id, entity.title]))

  return ids
    .map((id) => ({
      id,
      title: labels.get(id) ?? 'Sin titulo',
      totalSeconds: totals.get(id)?.totalSeconds ?? 0,
      sessions: totals.get(id)?.sessions ?? 0,
    }))
    .filter((item) => item.totalSeconds > 0)
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
}

function emptyStats(): TimeStats {
  return {
    todaySeconds: 0,
    weekSeconds: 0,
    totalSeconds: 0,
    sessionCount: 0,
    averageSessionSeconds: 0,
    unassignedSeconds: 0,
    daily: getLastDays(7),
    byProject: [],
    byGoal: [],
    recentSessions: [],
  }
}

export async function getTimeStats(userId: string): Promise<Result<TimeStats>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('time_entries')
    .select('id, project_id, goal_id, description, duration, started_at, ended_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) return err(error.message)

  const entries = (data ?? []) as TimeEntryRow[]
  if (entries.length === 0) return ok(emptyStats())

  const now = new Date()
  const weekStart = getStartOfWeek(now)
  const daily = getLastDays(7, now)
  const dailyByDate = new Map(daily.map((item) => [item.date, item]))
  let totalSeconds = 0
  let todaySeconds = 0
  let weekSeconds = 0
  let sessionCount = 0
  let unassignedSeconds = 0

  for (const entry of entries) {
    const duration = entry.duration ?? 0
    if (duration <= 0) continue

    const startedAt = new Date(entry.started_at)
    const dailyItem = dailyByDate.get(toDateKey(startedAt))
    totalSeconds += duration
    sessionCount += 1

    if (!entry.project_id && !entry.goal_id) {
      unassignedSeconds += duration
    }

    if (dailyItem) {
      dailyItem.totalSeconds += duration
    }

    if (isSameDay(startedAt, now)) {
      todaySeconds += duration
    }

    if (startedAt >= weekStart) {
      weekSeconds += duration
    }
  }

  const projectIds = Array.from(new Set(entries.map((entry) => entry.project_id).filter(Boolean))) as string[]
  const goalIds = Array.from(new Set(entries.map((entry) => entry.goal_id).filter(Boolean))) as string[]

  const [projectsRes, goalsRes] = await Promise.all([
    projectIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase.from('projects').select('id, title').eq('user_id', userId).in('id', projectIds),
    goalIds.length === 0
      ? Promise.resolve({ data: [], error: null })
      : supabase.from('goals').select('id, title').eq('user_id', userId).in('id', goalIds),
  ])

  if (projectsRes.error) return err(projectsRes.error.message)
  if (goalsRes.error) return err(goalsRes.error.message)

  const projects = (projectsRes.data ?? []) as NamedEntity[]
  const goals = (goalsRes.data ?? []) as NamedEntity[]
  const projectLabels = new Map(projects.map((project) => [project.id, project.title]))
  const goalLabels = new Map(goals.map((goal) => [goal.id, goal.title]))

  return ok({
    todaySeconds,
    weekSeconds,
    totalSeconds,
    sessionCount,
    averageSessionSeconds: sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0,
    unassignedSeconds,
    daily,
    byProject: buildBreakdown(projectIds, entries, 'project_id', projects),
    byGoal: buildBreakdown(goalIds, entries, 'goal_id', goals),
    recentSessions: entries
      .filter((entry) => (entry.duration ?? 0) > 0)
      .slice(0, 8)
      .map((entry) => ({
        id: entry.id,
        description: entry.description,
        startedAt: entry.started_at,
        endedAt: entry.ended_at,
        durationSeconds: entry.duration ?? 0,
        projectTitle: entry.project_id ? (projectLabels.get(entry.project_id) ?? 'Sin proyecto') : null,
        goalTitle: entry.goal_id ? (goalLabels.get(entry.goal_id) ?? 'Sin meta') : null,
      })),
  })
}
