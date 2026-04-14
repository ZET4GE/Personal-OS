import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/services/dashboard'

import { DashboardHeader } from '@/components/dashboard/widgets/DashboardHeader'
import { StatsGrid } from '@/components/dashboard/widgets/StatsGrid'
import { TodayHabits } from '@/components/dashboard/widgets/TodayHabits'
import { StreakWidget } from '@/components/dashboard/widgets/StreakWidget'
import { UpcomingDeadlines } from '@/components/dashboard/widgets/UpcomingDeadlines'
import { PendingPayments } from '@/components/dashboard/widgets/PendingPayments'
import { RecentActivity } from '@/components/dashboard/widgets/RecentActivity'
import { GoogleCalendarWidget } from '@/components/integrations/GoogleCalendarWidget'
import { GitHubActivityWidget } from '@/components/integrations/GitHubActivityWidget'

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

  const data = await getDashboardData(supabase, user.id)
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
  const { google: hasGoogle, github: hasGitHub } = data.integrations

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <DashboardHeader data={data} userName={userName} />

      {/* Row 1: Stats */}
      <StatsGrid stats={data.stats} />

      {/* Row 2: Habits & Streak */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col">
          <TodayHabits data={data.todayHabits} todayStr={data.todayStr} />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <StreakWidget
            currentStreak={data.todayHabits.habits.reduce((max, h) => Math.max(max, h.streak), 0)}
            bestStreak={data.todayHabits.bestStreak}
          />
        </div>
      </div>

      {/* Row 3: Deadlines & Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingDeadlines deadlines={data.deadlines} />
        <PendingPayments payments={data.pendingPayments} />
      </div>

      {/* Row 4: Integration widgets (conditional) */}
      {(hasGoogle || hasGitHub) && (
        <div className={`grid grid-cols-1 gap-6 ${hasGoogle && hasGitHub ? 'lg:grid-cols-2' : ''}`}>
          {hasGoogle && (
            <Suspense fallback={<WidgetSkeleton />}>
              <GoogleCalendarWidget userId={user.id} />
            </Suspense>
          )}
          {hasGitHub && (
            <Suspense fallback={<WidgetSkeleton />}>
              <GitHubActivityWidget userId={user.id} />
            </Suspense>
          )}
        </div>
      )}

      {/* Row 5: Recent Activity */}
      <RecentActivity activity={data.recentActivity} />
    </div>
  )
}
