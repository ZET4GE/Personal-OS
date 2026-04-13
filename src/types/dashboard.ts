import type { HabitWithLogs } from './habits'

// ─────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalJobs:     number
  interviews:    number
  activeProjects: number
  activeClients: number
  responseRate:  number   // 0–100
  monthlyRevenue: number
}

// ─────────────────────────────────────────────────────────────
// Habit summary for today
// ─────────────────────────────────────────────────────────────

export interface TodayHabitsSummary {
  habits:       HabitWithLogs[]
  dueToday:     number
  completedToday: number
  bestStreak:   number
}

// ─────────────────────────────────────────────────────────────
// Upcoming deadlines (client projects with due_date ≤ 7 days)
// ─────────────────────────────────────────────────────────────

export interface DeadlineItem {
  id:        string
  title:     string
  clientName: string | null
  dueDate:   string   // 'YYYY-MM-DD'
  daysLeft:  number
  status:    string
}

// ─────────────────────────────────────────────────────────────
// Pending payments
// ─────────────────────────────────────────────────────────────

export interface PendingPaymentItem {
  id:         string
  title:      string
  clientName: string | null
  pending:    number
  currency:   string
  budget:     number
  paidAmount: number
}

// ─────────────────────────────────────────────────────────────
// Activity feed
// ─────────────────────────────────────────────────────────────

export type ActivityType =
  | 'job_applied'
  | 'job_interview'
  | 'job_offer'
  | 'project_created'
  | 'project_completed'
  | 'client_project_created'
  | 'habit_completed'

export interface ActivityItem {
  id:        string
  type:      ActivityType
  label:     string
  sub?:      string
  timestamp: string   // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Analytics summary for dashboard widget
// ─────────────────────────────────────────────────────────────

export interface DashboardAnalytics {
  viewsThisWeek: number
  weeklyChange:  number   // % change vs prior week
  totalViews:    number
}

// ─────────────────────────────────────────────────────────────
// Top-level aggregation
// ─────────────────────────────────────────────────────────────

export interface DashboardData {
  stats:           DashboardStats
  todayHabits:     TodayHabitsSummary
  deadlines:       DeadlineItem[]
  pendingPayments: PendingPaymentItem[]
  recentActivity:  ActivityItem[]
  analytics:       DashboardAnalytics
  todayStr:        string   // 'YYYY-MM-DD'
}
