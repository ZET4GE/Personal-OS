import type { SupabaseClient } from '@supabase/supabase-js'
import type { PageView, PageType, DailyStat, ProjectStat, AnalyticsSummary, DateRange } from '@/types/analytics'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateKey(isoString: string): string {
  return isoString.slice(0, 10)   // 'YYYY-MM-DD'
}

// ─────────────────────────────────────────────────────────────
// Fetch raw views for a user within N days
// ─────────────────────────────────────────────────────────────

export async function getPageViews(
  supabase: SupabaseClient,
  userId: string,
  days: DateRange = 30,
): Promise<PageView[]> {
  const since = daysAgo(days)

  const { data, error } = await supabase
    .from('page_views')
    .select('*')
    .eq('user_id', userId)
    .gte('viewed_at', since.toISOString())
    .order('viewed_at', { ascending: true })

  if (error || !data) return []
  return data as PageView[]
}

// ─────────────────────────────────────────────────────────────
// Build daily stats grid (fills gaps with 0)
// ─────────────────────────────────────────────────────────────

function buildDailyStats(views: PageView[], days: DateRange): DailyStat[] {
  const map = new Map<string, number>()

  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i)
    map.set(d.toISOString().slice(0, 10), 0)
  }

  for (const v of views) {
    const key = toDateKey(v.viewed_at)
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1)
    }
  }

  return Array.from(map.entries()).map(([date, views]) => ({ date, views }))
}

// ─────────────────────────────────────────────────────────────
// Build full summary from raw views
// ─────────────────────────────────────────────────────────────

function buildSummary(views: PageView[], days: DateRange, topProjects: ProjectStat[]): AnalyticsSummary {
  const now  = new Date()
  const week = 7 * 24 * 60 * 60 * 1000

  const thisWeekStart = new Date(now.getTime() - week)
  const prevWeekStart = new Date(now.getTime() - 2 * week)

  const viewsThisWeek = views.filter((v) => new Date(v.viewed_at) >= thisWeekStart).length
  const viewsPrevWeek = views.filter(
    (v) => new Date(v.viewed_at) >= prevWeekStart && new Date(v.viewed_at) < thisWeekStart,
  ).length

  const weeklyChange =
    viewsPrevWeek === 0
      ? viewsThisWeek > 0 ? 100 : 0
      : Math.round(((viewsThisWeek - viewsPrevWeek) / viewsPrevWeek) * 100)

  const uniqueVisitors = new Set(views.map((v) => v.visitor_id).filter(Boolean)).size

  const byPageType = {
    profile: views.filter((v) => v.page_type === 'profile').length,
    project: views.filter((v) => v.page_type === 'project').length,
    cv:      views.filter((v) => v.page_type === 'cv').length,
    post:    views.filter((v) => v.page_type === 'post').length,
  }

  return {
    totalViews:     views.length,
    uniqueVisitors,
    viewsThisWeek,
    viewsPrevWeek,
    weeklyChange,
    byPageType,
    dailyStats:   buildDailyStats(views, days),
    topProjects,
  }
}

// ─────────────────────────────────────────────────────────────
// Top projects — aggregate in JS, join titles from DB
// ─────────────────────────────────────────────────────────────

async function getTopProjects(
  supabase: SupabaseClient,
  userId: string,
  views: PageView[],
  limit = 5,
): Promise<ProjectStat[]> {
  const projectViews = views.filter((v) => v.page_type === 'project' && v.page_id)

  const counts = new Map<string, number>()
  for (const v of projectViews) {
    const id = v.page_id!
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  if (sorted.length === 0) return []

  const ids = sorted.map(([id]) => id)

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .in('id', ids)

  const titleMap = new Map<string, string>(
    (projects ?? []).map((p: { id: string; title: string }) => [p.id, p.title]),
  )

  return sorted.map(([page_id, views]) => ({
    page_id,
    views,
    title: titleMap.get(page_id) ?? 'Proyecto eliminado',
  }))
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export async function getAnalyticsSummary(
  supabase: SupabaseClient,
  userId: string,
  days: DateRange = 30,
): Promise<AnalyticsSummary> {
  const views       = await getPageViews(supabase, userId, days)
  const topProjects = await getTopProjects(supabase, userId, views)
  return buildSummary(views, days, topProjects)
}

// ─────────────────────────────────────────────────────────────
// Track a page view (server-side insert)
// ─────────────────────────────────────────────────────────────

export interface TrackInput {
  userId:     string          // owner del contenido
  pageType:   PageType
  pageId?:    string | null
  visitorId:  string          // fingerprint
  referrer?:  string | null
  userAgent?: string | null
  country?:   string | null
  city?:      string | null
}

export async function trackPageView(
  supabase: SupabaseClient,
  input: TrackInput,
): Promise<void> {
  await supabase.from('page_views').insert({
    user_id:    input.userId,
    page_type:  input.pageType,
    page_id:    input.pageId    ?? null,
    visitor_id: input.visitorId,
    referrer:   input.referrer  ?? null,
    user_agent: input.userAgent ?? null,
    country:    input.country   ?? null,
    city:       input.city      ?? null,
  })
}
