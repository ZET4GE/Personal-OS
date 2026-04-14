import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { DashboardData } from '@/types/dashboard'

export async function DashboardHeader({ data, userName }: { data: DashboardData; userName: string }) {
  const t      = await getTranslations('dashboard')
  const locale = await getLocale()

  // Greeting by time of day
  const hour = new Date().getHours()
  let greeting: string
  if (hour >= 6 && hour < 12)      greeting = t('greeting.morning')
  else if (hour >= 12 && hour < 19) greeting = t('greeting.afternoon')
  else                               greeting = t('greeting.evening')

  // Contextual message
  const dueHabits = data.todayHabits.habits.filter((h) => {
    const todayLog = h.recentDays.find((d) => d.date === data.todayStr)
    return todayLog && todayLog.isDue && !h.todayCompleted
  }).length

  const currentStreak = Math.max(...data.todayHabits.habits.map((h) => h.streak), 0)

  let contextualMessage: string
  if (dueHabits > 0) {
    contextualMessage = t('contextual.pendingHabitsMessage', { count: dueHabits })
  } else if (data.deadlines.some((d) => d.daysLeft < 7)) {
    const dls = data.deadlines.filter((d) => d.daysLeft < 7).length
    contextualMessage = t('contextual.upcomingDeadlinesMessage', { count: dls })
  } else if (currentStreak >= 3) {
    contextualMessage = t('contextual.streakMessage', { count: currentStreak })
  } else {
    contextualMessage = t('contextual.allGood')
  }

  const dateFormatted = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  }).format(new Date(data.todayStr + 'T12:00:00'))

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-muted capitalize">{dateFormatted}</p>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {greeting}, {userName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">{contextualMessage}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/jobs?new=true"
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text border border-border hover:border-border-bright transition-colors"
        >
          <Plus size={14} /> {t('quickActions.newJob')}
        </Link>
        <Link
          href="/projects?new=true"
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text border border-border hover:border-border-bright transition-colors"
        >
          <Plus size={14} /> {t('quickActions.newProject')}
        </Link>
        <Link
          href="/habits/manage"
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text border border-border hover:border-border-bright transition-colors"
        >
          <Plus size={14} /> {t('quickActions.newHabit')}
        </Link>
      </div>
    </div>
  )
}
