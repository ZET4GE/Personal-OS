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
  project_id: string | null
  goal_id: string | null
  duration: number | null
  started_at: string
}

interface NamedEntity {
  id: string
  title: string
}

export interface TimeStatsBreakdownItem {
  id: string
  title: string
  totalSeconds: number
}

export interface TimeStats {
  todaySeconds: number
  weekSeconds: number
  totalSeconds: number
  byProject: TimeStatsBreakdownItem[]
  byGoal: TimeStatsBreakdownItem[]
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

function buildBreakdown(
  ids: string[],
  entries: TimeEntryRow[],
  key: 'project_id' | 'goal_id',
  entities: NamedEntity[],
): TimeStatsBreakdownItem[] {
  const totals = new Map<string, number>()

  for (const entry of entries) {
    const entityId = entry[key]
    const duration = entry.duration ?? 0
    if (!entityId || duration <= 0) continue
    totals.set(entityId, (totals.get(entityId) ?? 0) + duration)
  }

  const labels = new Map(entities.map((entity) => [entity.id, entity.title]))

  return ids
    .map((id) => ({
      id,
      title: labels.get(id) ?? 'Sin título',
      totalSeconds: totals.get(id) ?? 0,
    }))
    .filter((item) => item.totalSeconds > 0)
    .sort((a, b) => b.totalSeconds - a.totalSeconds)
}

export async function getTimeStats(userId: string): Promise<Result<TimeStats>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('time_entries')
    .select('project_id, goal_id, duration, started_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) return err(error.message)

  const entries = (data ?? []) as TimeEntryRow[]
  if (entries.length === 0) {
    return ok({
      todaySeconds: 0,
      weekSeconds: 0,
      totalSeconds: 0,
      byProject: [],
      byGoal: [],
    })
  }

  const now = new Date()
  const weekStart = getStartOfWeek(now)
  let totalSeconds = 0
  let todaySeconds = 0
  let weekSeconds = 0

  for (const entry of entries) {
    const duration = entry.duration ?? 0
    if (duration <= 0) continue

    const startedAt = new Date(entry.started_at)
    totalSeconds += duration

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

  return ok({
    todaySeconds,
    weekSeconds,
    totalSeconds,
    byProject: buildBreakdown(projectIds, entries, 'project_id', (projectsRes.data ?? []) as NamedEntity[]),
    byGoal: buildBreakdown(goalIds, entries, 'goal_id', (goalsRes.data ?? []) as NamedEntity[]),
  })
}
