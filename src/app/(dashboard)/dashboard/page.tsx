import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/services/dashboard'
import { getGoals } from '@/services/goals'
import { getUserOnboarding } from '@/services/onboarding'
import { getEnabledModules } from '@/lib/navigation/modules'
import type { DashboardWidgetSize } from '@/types/dashboard-config'
import type { EnabledModule } from '@/types/onboarding'

import { StatsGrid } from '@/components/dashboard/widgets/StatsGrid'
import { TodayHabits } from '@/components/dashboard/widgets/TodayHabits'
import { StreakWidget } from '@/components/dashboard/widgets/StreakWidget'
import { UpcomingDeadlines } from '@/components/dashboard/widgets/UpcomingDeadlines'
import { PendingPayments } from '@/components/dashboard/widgets/PendingPayments'
import { TimeInvestedWidget } from '@/components/dashboard/widgets/TimeInvestedWidget'
import { RecentActivity } from '@/components/dashboard/widgets/RecentActivity'
import { GoogleCalendarWidget } from '@/components/integrations/GoogleCalendarWidget'
import { GitHubActivityWidget } from '@/components/integrations/GitHubActivityWidget'
import { RecentNotes } from '@/components/dashboard/widgets/RecentNotes'
import { GoalsWidget } from '@/components/dashboard/widgets/GoalsWidget'
import { DashboardGoalsPanel } from '@/components/dashboard/widgets/DashboardGoalsPanel'
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer'
import { FocusDashboard } from '@/components/dashboard/focus/FocusDashboard'
import { GettingStartedGuide } from '@/components/dashboard/focus/GettingStartedGuide'

export const metadata: Metadata = { title: 'Dashboard' }

interface DashboardPageWidget {
  id: string
  type: string
  title: string
  defaultSize: DashboardWidgetSize
  defaultVisible?: boolean
  module?: EnabledModule
  content: ReactNode
}

function WidgetSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-3" />
        ))}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [goalsResult, onboardingResult] = await Promise.all([
    getGoals(supabase, user.id),
    getUserOnboarding(supabase, user.id),
  ])

  if ((goalsResult.data?.length ?? 0) === 0 && !onboardingResult.data?.completed) {
    redirect('/onboarding')
  }

  const enabledModules = getEnabledModules(onboardingResult.data)
  const data = await getDashboardData(supabase, user.id, enabledModules)
  const [roadmapsCountResult, timeEntriesCountResult] = await Promise.all([
    supabase
      .from('learning_roadmaps')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('time_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
  const { google: hasGoogle, github: hasGitHub } = data.integrations
  const goals = goalsResult.data ?? []
  const enabled = new Set(enabledModules)
  const activeGoal =
    goals.find((goal) => goal.id === onboardingResult.data?.primary_goal_id)
    ?? goals.find((goal) => goal.status === 'active')
    ?? goals[0]
    ?? null
  const hasActionSystem =
    (enabled.has('habits') && data.todayHabits.dueToday > 0)
    || (enabled.has('projects') && data.stats.activeProjects > 0)
    || (enabled.has('freelance') && data.deadlines.length > 0)
  const widgets: DashboardPageWidget[] = [
    {
      id: 'dashboard-goals',
      type: 'dashboard-goals',
      title: 'Metas',
      defaultSize: 'md' as const,
      content: <DashboardGoalsPanel initialGoals={goals} />,
    },
    {
      id: 'stats-grid',
      type: 'stats-grid',
      module: 'projects',
      title: 'Estadísticas',
      defaultSize: 'xl' as const,
      defaultVisible: false,
      content: <StatsGrid stats={data.stats} />,
    },
    {
      id: 'today-habits',
      type: 'today-habits',
      module: 'habits',
      title: 'Hábitos de hoy',
      defaultSize: 'md' as const,
      content: <TodayHabits data={data.todayHabits} todayStr={data.todayStr} />,
    },
    {
      id: 'streak-widget',
      type: 'streak-widget',
      module: 'habits',
      title: 'Racha',
      defaultSize: 'sm' as const,
      defaultVisible: false,
      content: (
        <StreakWidget
          currentStreak={data.todayHabits.habits.reduce((max, h) => Math.max(max, h.streak), 0)}
          bestStreak={data.todayHabits.bestStreak}
        />
      ),
    },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      module: 'freelance',
      title: 'Deadlines',
      defaultSize: 'md' as const,
      defaultVisible: false,
      content: <UpcomingDeadlines deadlines={data.deadlines} />,
    },
    {
      id: 'time-invested',
      type: 'time-invested',
      module: 'time',
      title: 'Tiempo invertido',
      defaultSize: 'md' as const,
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <TimeInvestedWidget userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'pending-payments',
      type: 'pending-payments',
      module: 'freelance',
      title: 'Pagos pendientes',
      defaultSize: 'md' as const,
      defaultVisible: false,
      content: <PendingPayments payments={data.pendingPayments} />,
    },
    ...(hasGoogle
      ? [{
          id: 'google-calendar',
          type: 'google-calendar',
          title: 'Google Calendar',
          defaultSize: 'md' as const,
          defaultVisible: false,
          content: (
            <Suspense fallback={<WidgetSkeleton />}>
              <GoogleCalendarWidget userId={user.id} />
            </Suspense>
          ),
        }]
      : []),
    ...(hasGitHub
      ? [{
          id: 'github-activity',
          type: 'github-activity',
          title: 'GitHub',
          defaultSize: 'md' as const,
          defaultVisible: false,
          content: (
            <Suspense fallback={<WidgetSkeleton />}>
              <GitHubActivityWidget userId={user.id} />
            </Suspense>
          ),
        }]
      : []),
    {
      id: 'goals-widget',
      type: 'goals-widget',
      title: 'Mis metas',
      defaultSize: 'sm' as const,
      defaultVisible: false,
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <GoalsWidget userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'recent-notes',
      type: 'recent-notes',
      module: 'notes',
      title: 'Notas recientes',
      defaultSize: 'sm' as const,
      defaultVisible: false,
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <RecentNotes userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'recent-activity',
      type: 'recent-activity',
      module: 'projects',
      title: 'Actividad reciente',
      defaultSize: 'md' as const,
      defaultVisible: false,
      content: <RecentActivity activity={data.recentActivity} />,
    },
  ]
  const visibleWidgets = widgets.filter((widget) => !widget.module || enabled.has(widget.module))

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <div>
        <p className="text-sm text-muted">Hola, {userName}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Tu foco de hoy</h1>
      </div>

      <GettingStartedGuide
        hasActiveGoal={Boolean(activeGoal)}
        hasRoadmap={(roadmapsCountResult.count ?? 0) > 0}
        hasActionSystem={hasActionSystem}
        hasTimeEntry={(timeEntriesCountResult.count ?? 0) > 0}
        hasConfiguredModules={Boolean(onboardingResult.data?.enabled_modules?.length)}
      />

      <FocusDashboard
        activeGoal={activeGoal}
        dashboardData={data}
        enabledModules={enabledModules}
      />

      <details className="group rounded-2xl border border-border bg-surface/60 p-4 shadow-[var(--shadow-card)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-text">Widgets adicionales</h2>
            <p className="text-xs text-muted">Informacion secundaria. Abrila solo cuando la necesites.</p>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted transition-colors group-open:bg-surface-2">
            <span className="group-open:hidden">Mostrar</span>
            <span className="hidden group-open:inline">Ocultar</span>
          </span>
        </summary>
        <div className="mt-5">
          <DashboardCustomizer widgets={visibleWidgets} />
        </div>
      </details>
    </div>
  )
}
