import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { DashboardData } from '@/types/dashboard'

export function DashboardHeader({ data, userName }: { data: DashboardData; userName: string }) {
  const currentHour = new Date().getHours()
  let greeting = 'Buenos días'
  if (currentHour >= 12 && currentHour < 19) greeting = 'Buenas tardes'
  else if (currentHour >= 19) greeting = 'Buenas noches'

  // Contextual message
  const dueHabits = data.todayHabits.habits.filter(h => {
    const todayLog = h.recentDays.find(d => d.date === data.todayStr)
    return todayLog && todayLog.isDue && !h.todayCompleted
  }).length

  const currentStreak = Math.max(...data.todayHabits.habits.map(h => h.streak), 0)

  let contextualMessage = ''
  if (dueHabits > 0) {
    contextualMessage = `Tenés ${dueHabits} hábito${dueHabits > 1 ? 's' : ''} pendiente${dueHabits > 1 ? 's' : ''} hoy.`
  } else if (data.deadlines.some(d => d.daysLeft < 7)) {
    const dls = data.deadlines.filter(d => d.daysLeft < 7).length
    contextualMessage = `${dls} proyecto${dls > 1 ? 's' : ''} vence${dls > 1 ? 'n' : ''} en los próximos 7 días.`
  } else if (currentStreak >= 3) {
    contextualMessage = `¡Racha de ${currentStreak} días! Seguí así 🔥`
  } else {
    contextualMessage = 'Todo al día. ¡Buen trabajo!'
  }

  const dateFormatted = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
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
          <Plus size={14} /> Nuevo empleo
        </Link>
        <Link 
          href="/projects?new=true" 
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text border border-border hover:border-border-bright transition-colors"
        >
          <Plus size={14} /> Nuevo proyecto
        </Link>
        <Link 
          href="/habits/manage" 
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text border border-border hover:border-border-bright transition-colors"
        >
          <Plus size={14} /> Nuevo hábito
        </Link>
      </div>
    </div>
  )
}