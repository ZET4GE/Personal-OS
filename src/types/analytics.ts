// ─────────────────────────────────────────────────────────────
// Page type
// ─────────────────────────────────────────────────────────────

export const PAGE_TYPES = ['profile', 'project', 'cv'] as const
export type PageType = (typeof PAGE_TYPES)[number]

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  profile: 'Perfil',
  project: 'Proyectos',
  cv:      'CV',
}

// ─────────────────────────────────────────────────────────────
// Core entity (espejo de la tabla SQL)
// ─────────────────────────────────────────────────────────────

export interface PageView {
  id:         string
  user_id:    string | null
  page_type:  PageType
  page_id:    string | null
  visitor_id: string | null
  referrer:   string | null
  user_agent: string | null
  country:    string | null
  city:       string | null
  viewed_at:  string    // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Aggregated types
// ─────────────────────────────────────────────────────────────

export interface DailyStat {
  date:  string   // 'YYYY-MM-DD'
  views: number
}

export interface ProjectStat {
  page_id: string
  views:   number
  title:   string  // joined from projects table
}

export interface AnalyticsSummary {
  totalViews:     number
  uniqueVisitors: number
  viewsThisWeek:  number
  viewsPrevWeek:  number
  weeklyChange:   number          // porcentaje; puede ser Infinity si prev=0
  byPageType:     Record<PageType, number>
  dailyStats:     DailyStat[]
  topProjects:    ProjectStat[]
}

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

export type DateRange = 7 | 14 | 30 | 90
