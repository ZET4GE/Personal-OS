import { Target, CheckCircle2, TrendingUp, PauseCircle } from 'lucide-react'
import type { GoalStats } from '@/types/goals'

interface GoalStatsProps {
  stats: GoalStats
}

export function GoalStats({ stats }: GoalStatsProps) {
  const cards = [
    { label: 'Activas',      value: stats.active,      icon: Target,       color: 'text-blue-500',    bg: 'bg-blue-500/10'    },
    { label: 'Completadas',  value: stats.completed,   icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pausadas',     value: stats.paused,      icon: PauseCircle,  color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
    { label: 'Progreso avg', value: `${stats.avgProgress}%`, icon: TrendingUp,  color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
              <Icon size={16} className={card.color} />
            </span>
            <div>
              <p className="text-xs text-muted">{card.label}</p>
              <p className="text-xl font-bold text-text">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
