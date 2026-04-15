import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DashboardData,
  DashboardStats,
  TodayHabitsSummary,
  DeadlineItem,
  PendingPaymentItem,
  ActivityItem,
  DashboardAnalytics,
  DashboardIntegrations,
} from '@/types/dashboard'
import type { JobApplication } from '@/types/jobs'
import type { ClientProject } from '@/types/clients'
import { getHabitsWithLogs, isHabitDueOn } from './habits'
import { getPageViews } from './analytics'
import { getActiveProviders } from './integrations'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(dateStr: string, todayStr: string): number {
  const due   = new Date(dateStr + 'T12:00:00')
  const today = new Date(todayStr + 'T12:00:00')
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

// ─────────────────────────────────────────────────────────────
// Stats (jobs + projects + clients)
// ─────────────────────────────────────────────────────────────

async function fetchStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardStats> {
  const [jobsRes, projectsRes, clientsRes, cpRes] = await Promise.all([
    supabase.from('job_applications').select('id, status'),
    supabase.from('projects').select('id, status').eq('user_id', userId),
    supabase.from('clients').select('id'),
    supabase.from('client_projects').select('paid_amount, updated_at'),
  ])

  const jobs     = (jobsRes.data     ?? []) as Array<{ id: string; status: string }>
  const projects = (projectsRes.data ?? []) as Array<{ id: string; status: string }>
  const clients  = (clientsRes.data  ?? []) as Array<{ id: string }>
  const cProjects= (cpRes.data       ?? []) as Array<{ paid_amount: number; updated_at: string }>

  const totalJobs      = jobs.length
  const interviews     = jobs.filter((j) => j.status === 'interview').length
  const responded      = jobs.filter((j) => j.status !== 'applied').length
  const responseRate   = totalJobs > 0 ? Math.round((responded / totalJobs) * 100) : 0
  const activeProjects = projects.filter((p) => p.status === 'in_progress').length
  const activeClients  = clients.length

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthlyRevenue = cProjects
    .filter((cp) => {
      const d = new Date(cp.updated_at)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, cp) => sum + (cp.paid_amount || 0), 0)

  return { totalJobs, interviews, activeProjects, activeClients, responseRate, monthlyRevenue }
}

// ─────────────────────────────────────────────────────────────
// Today's habits
// ─────────────────────────────────────────────────────────────

async function fetchTodayHabits(
  supabase: SupabaseClient,
  userId: string,
  todayStr: string,
): Promise<TodayHabitsSummary> {
  const result = await getHabitsWithLogs(supabase, userId, todayStr)
  const habits = result.data ?? []

  const today = new Date(todayStr + 'T12:00:00')
  const dueToday = habits.filter((h) => isHabitDueOn(h.habit, today)).length
  const completedToday = habits.filter((h) => h.todayCompleted).length
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  return { habits, dueToday, completedToday, bestStreak }
}

// ─────────────────────────────────────────────────────────────
// Upcoming deadlines (client projects)
// ─────────────────────────────────────────────────────────────

async function fetchDeadlines(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<DeadlineItem[]> {
  const horizon = new Date(todayStr + 'T12:00:00')
  horizon.setDate(horizon.getDate() + 14)
  const horizonStr = horizon.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('client_projects')
    .select('id, title, status, due_date, client:clients(name)')
    .not('due_date', 'is', null)
    .lte('due_date', horizonStr)
    .gte('due_date', todayStr)
    .not('status', 'in', '("completed","cancelled")')
    .order('due_date', { ascending: true })
    .limit(5)

  if (!data) return []

  return (data as any[]).map((p) => {
    const clientName = Array.isArray(p.client) ? p.client[0]?.name : p.client?.name;
    return {
      id:         p.id,
      title:      p.title,
      clientName: clientName ?? null,
      dueDate:    p.due_date,
      daysLeft:   daysUntil(p.due_date, todayStr),
      status:     p.status,
    };
  })
}

// ─────────────────────────────────────────────────────────────
// Pending payments
// ─────────────────────────────────────────────────────────────

async function fetchPendingPayments(
  supabase: SupabaseClient,
): Promise<PendingPaymentItem[]> {
  const { data } = await supabase
    .from('client_projects')
    .select('id, title, budget, paid_amount, currency, client:clients(name)')
    .not('budget', 'is', null)
    .not('status', 'in', '("completed","cancelled")')
    .order('updated_at', { ascending: false })

  if (!data) return []

  const projects = data as any[]

  return projects
    .filter((p) => p.budget > p.paid_amount)
    .map((p) => {
      const clientName = Array.isArray(p.client) ? p.client[0]?.name : p.client?.name;
      return {
        id:         p.id,
        title:      p.title,
        clientName: clientName ?? null,
        pending:    p.budget - p.paid_amount,
        currency:   p.currency,
        budget:     p.budget,
        paidAmount: p.paid_amount,
        };
    })
    .slice(0, 5)
}

// ─────────────────────────────────────────────────────────────
// Recent activity
// ─────────────────────────────────────────────────────────────

async function fetchRecentActivity(
  supabase: SupabaseClient,
  userId: string,
): Promise<ActivityItem[]> {
  const [jobsRes, projectsRes, cpRes] = await Promise.all([
    supabase
      .from('job_applications')
      .select('id, company, role, status, applied_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('projects')
      .select('id, title, status, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(3),
    supabase
      .from('client_projects')
      .select('id, title, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(3),
  ])

  const items: ActivityItem[] = []

  for (const j of ((jobsRes.data ?? []) as JobApplication[])) {
    if (j.status === 'interview') {
      items.push({
        id:        `job-int-${j.id}`,
        type:      'job_interview',
        label:     `Entrevista en ${j.company}`,
        sub:       j.role,
        timestamp: j.updated_at,
      })
    } else if (j.status === 'offer') {
      items.push({
        id:        `job-off-${j.id}`,
        type:      'job_offer',
        label:     `Oferta de ${j.company}`,
        sub:       j.role,
        timestamp: j.updated_at,
      })
    } else {
      items.push({
        id:        `job-app-${j.id}`,
        type:      'job_applied',
        label:     `Postulado a ${j.company}`,
        sub:       j.role,
        timestamp: j.applied_at,
      })
    }
  }

  for (const p of ((projectsRes.data ?? []) as Array<{ id: string; title: string; status: string; created_at: string; updated_at: string }>)) {
    if (p.status === 'completed') {
      items.push({
        id:        `proj-done-${p.id}`,
        type:      'project_completed',
        label:     `Proyecto completado: ${p.title}`,
        timestamp: p.updated_at,
      })
    } else {
      items.push({
        id:        `proj-new-${p.id}`,
        type:      'project_created',
        label:     `Nuevo proyecto: ${p.title}`,
        timestamp: p.created_at,
      })
    }
  }

  for (const cp of ((cpRes.data ?? []) as Array<{ id: string; title: string; status: string; created_at: string; updated_at: string }>)) {
    items.push({
      id:        `cp-${cp.id}`,
      type:      'client_project_created',
      label:     `Proyecto freelance: ${cp.title}`,
      timestamp: cp.created_at,
    })
  }

  // Sort by timestamp desc, take top 8
  return items
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)
}

// ─────────────────────────────────────────────────────────────
// Analytics widget
// ─────────────────────────────────────────────────────────────

async function fetchAnalytics(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardAnalytics> {
  const views = await getPageViews(supabase, userId, 14)

  const now           = Date.now()
  const weekMs        = 7 * 24 * 60 * 60 * 1000
  const weekAgo       = now - weekMs
  const twoWeeksAgo   = now - 2 * weekMs

  const viewsThisWeek = views.filter((v) => new Date(v.viewed_at).getTime() >= weekAgo).length
  const viewsPrevWeek = views.filter((v) => {
    const t = new Date(v.viewed_at).getTime()
    return t >= twoWeeksAgo && t < weekAgo
  }).length

  const weeklyChange =
    viewsPrevWeek === 0
      ? viewsThisWeek > 0 ? 100 : 0
      : Math.round(((viewsThisWeek - viewsPrevWeek) / viewsPrevWeek) * 100)

  return { viewsThisWeek, weeklyChange, totalViews: views.length }
}

// ─────────────────────────────────────────────────────────────
// Main aggregation
// ─────────────────────────────────────────────────────────────

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardData> {
  const todayStr = todayISO()

  const [stats, todayHabits, deadlines, pendingPayments, recentActivity, analytics, integrations] =
    await Promise.all([
      fetchStats(supabase, userId),
      fetchTodayHabits(supabase, userId, todayStr),
      fetchDeadlines(supabase, todayStr),
      fetchPendingPayments(supabase),
      fetchRecentActivity(supabase, userId),
      fetchAnalytics(supabase, userId),
      getActiveProviders(supabase, userId),
    ])

  return { stats, todayHabits, deadlines, pendingPayments, recentActivity, analytics, integrations, todayStr }
}
