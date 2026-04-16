import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/services/dashboard'
import { getGoals } from '@/services/goals'
import { getUserOnboarding } from '@/services/onboarding'

import { DashboardHeader } from '@/components/dashboard/widgets/DashboardHeader'
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
import { DashboardInsights } from '@/components/dashboard/widgets/DashboardInsights'
import { DashboardGoalsPanel } from '@/components/dashboard/widgets/DashboardGoalsPanel'
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer'

export const metadata: Metadata = { title: 'Dashboard' }

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

  const data = await getDashboardData(supabase, user.id)
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
  const { google: hasGoogle, github: hasGitHub } = data.integrations
  const widgets = [
    {
      id: 'dashboard-goals',
      type: 'dashboard-goals',
      title: 'Metas',
      defaultSize: 'md' as const,
      content: <DashboardGoalsPanel />,
    },
    {
      id: 'stats-grid',
      type: 'stats-grid',
      title: 'Estadísticas',
      defaultSize: 'xl' as const,
      content: <StatsGrid stats={data.stats} />,
    },
    {
      id: 'today-habits',
      type: 'today-habits',
      title: 'Hábitos de hoy',
      defaultSize: 'md' as const,
      content: <TodayHabits data={data.todayHabits} todayStr={data.todayStr} />,
    },
    {
      id: 'streak-widget',
      type: 'streak-widget',
      title: 'Racha',
      defaultSize: 'sm' as const,
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
      title: 'Deadlines',
      defaultSize: 'md' as const,
      content: <UpcomingDeadlines deadlines={data.deadlines} />,
    },
    {
      id: 'time-invested',
      type: 'time-invested',
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
      title: 'Pagos pendientes',
      defaultSize: 'md' as const,
      content: <PendingPayments payments={data.pendingPayments} />,
    },
    ...(hasGoogle
      ? [{
          id: 'google-calendar',
          type: 'google-calendar',
          title: 'Google Calendar',
          defaultSize: 'md' as const,
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
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <GoalsWidget userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'dashboard-insights',
      type: 'dashboard-insights',
      title: 'Insights',
      defaultSize: 'sm' as const,
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <DashboardInsights userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'recent-notes',
      type: 'recent-notes',
      title: 'Notas recientes',
      defaultSize: 'sm' as const,
      content: (
        <Suspense fallback={<WidgetSkeleton />}>
          <RecentNotes userId={user.id} />
        </Suspense>
      ),
    },
    {
      id: 'recent-activity',
      type: 'recent-activity',
      title: 'Actividad reciente',
      defaultSize: 'md' as const,
      defaultVisible: false,
      content: <RecentActivity activity={data.recentActivity} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader data={data} userName={userName} />
      <DashboardCustomizer widgets={widgets} />
    </div>
  )
}
