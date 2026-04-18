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
  share: number
  lastTrackedAt: string | null
}

export interface TimeStatsDailyItem {
  date: string
  label: string
  totalSeconds: number
  sessions: number
}

export interface TimeStatsSessionItem {
  id: string
  description: string | null
  startedAt: string
  endedAt: string | null
  durationSeconds: number
  projectId: string | null
  projectTitle: string | null
  goalId: string | null
  goalTitle: string | null
}

export interface TimeStats {
  todaySeconds: number
  weekSeconds: number
  monthSeconds: number
  last7DaysSeconds: number
  totalSeconds: number
  sessionCount: number
  averageSessionSeconds: number
  assignedSeconds: number
  unassignedSeconds: number
  assignmentRate: number
  consistencyDays: number
  focusScore: number
  bestDay: TimeStatsDailyItem | null
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
      sessions: 0,
    }
  })
}

function buildBreakdown(
  ids: string[],
  entries: TimeEntryRow[],
  key: 'project_id' | 'goal_id',
  entities: NamedEntity[],
  totalSeconds: number,
): TimeStatsBreakdownItem[] {
  const totals = new Map<string, { totalSeconds: number; sessions: number; lastTrackedAt: string | null }>()

  for (const entry of entries) {
    const entityId = entry[key]
    const duration = entry.duration ?? 0
    if (!entityId || duration <= 0) continue
    const current = totals.get(entityId) ?? { totalSeconds: 0, sessions: 0, lastTrackedAt: null }
    totals.set(entityId, {
      totalSeconds: current.totalSeconds + duration,
      sessions: current.sessions + 1,
      lastTrackedAt: !current.lastTrackedAt || entry.started_at > current.lastTrackedAt
        ? entry.started_at
        : current.lastTrackedAt,
    })
  }

  const labels = new Map(entities.map((entity) => [entity.id, entity.title]))

  return ids
    .map((id) => ({
      id,
      title: labels.get(id) ?? 'Sin titulo',
      totalSeconds: totals.get(id)?.totalSeconds ?? 0,
      sessions: totals.get(id)?.sessions ?? 0,
      share: totalSeconds > 0 ? (totals.get(id)?.totalSeconds ?? 0) / totalSeconds : 0,
      lastTrackedAt: totals.get(id)?.lastTrackedAt ?? null,
    }))
    .filter((item) => item.totalSeconds > 0)
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
}

function emptyStats(): TimeStats {
  return {
    todaySeconds: 0,
    weekSeconds: 0,
    monthSeconds: 0,
    last7DaysSeconds: 0,
    totalSeconds: 0,
    sessionCount: 0,
    averageSessionSeconds: 0,
    assignedSeconds: 0,
    unassignedSeconds: 0,
    assignmentRate: 0,
    consistencyDays: 0,
    focusScore: 0,
    bestDay: null,
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
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const last7Start = new Date(now)
  last7Start.setHours(0, 0, 0, 0)
  last7Start.setDate(last7Start.getDate() - 6)
  const daily = getLastDays(7, now)
  const dailyByDate = new Map(daily.map((item) => [item.date, item]))
  let totalSeconds = 0
  let todaySeconds = 0
  let weekSeconds = 0
  let monthSeconds = 0
  let last7DaysSeconds = 0
  let sessionCount = 0
  let assignedSeconds = 0
  let unassignedSeconds = 0

  for (const entry of entries) {
    const duration = entry.duration ?? 0
    if (duration <= 0) continue

    const startedAt = new Date(entry.started_at)
    const dailyItem = dailyByDate.get(toDateKey(startedAt))
    totalSeconds += duration
    sessionCount += 1

    if (entry.project_id || entry.goal_id) {
      assignedSeconds += duration
    } else {
      unassignedSeconds += duration
    }

    if (dailyItem) {
      dailyItem.totalSeconds += duration
      dailyItem.sessions += 1
    }

    if (isSameDay(startedAt, now)) {
      todaySeconds += duration
    }

    if (startedAt >= weekStart) {
      weekSeconds += duration
    }

    if (startedAt >= monthStart) {
      monthSeconds += duration
    }

    if (startedAt >= last7Start) {
      last7DaysSeconds += duration
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
  const consistencyDays = daily.filter((item) => item.totalSeconds > 0).length
  const assignmentRate = totalSeconds > 0 ? assignedSeconds / totalSeconds : 0
  const consistencyRate = consistencyDays / 7
  const focusScore = Math.round((assignmentRate * 0.55 + consistencyRate * 0.45) * 100)
  const bestDay = daily.reduce<TimeStatsDailyItem | null>((best, item) => {
    if (!best || item.totalSeconds > best.totalSeconds) return item
    return best
  }, null)

  return ok({
    todaySeconds,
    weekSeconds,
    monthSeconds,
    last7DaysSeconds,
    totalSeconds,
    sessionCount,
    averageSessionSeconds: sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0,
    assignedSeconds,
    unassignedSeconds,
    assignmentRate,
    consistencyDays,
    focusScore,
    bestDay: bestDay && bestDay.totalSeconds > 0 ? bestDay : null,
    daily,
    byProject: buildBreakdown(projectIds, entries, 'project_id', projects, totalSeconds),
    byGoal: buildBreakdown(goalIds, entries, 'goal_id', goals, totalSeconds),
    recentSessions: entries
      .filter((entry) => (entry.duration ?? 0) > 0)
      .slice(0, 8)
      .map((entry) => ({
        id: entry.id,
        description: entry.description,
        startedAt: entry.started_at,
        endedAt: entry.ended_at,
        durationSeconds: entry.duration ?? 0,
        projectId: entry.project_id,
        projectTitle: entry.project_id ? (projectLabels.get(entry.project_id) ?? 'Sin proyecto') : null,
        goalId: entry.goal_id,
        goalTitle: entry.goal_id ? (goalLabels.get(entry.goal_id) ?? 'Sin meta') : null,
      })),
  })
}
