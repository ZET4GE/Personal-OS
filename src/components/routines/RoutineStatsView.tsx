'use client'

import type { RoutineStats, RoutineStatDay } from '@/services/routines'

const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

const TIME_LABELS: Record<string, string> = {
  morning:   'Mañana',
  afternoon: 'Tarde',
  evening:   'Noche',
  anytime:   'Cualquier momento',
}

function RoutineHeatmap({ stat }: { stat: RoutineStats }) {
  const { routine, last30days, completionRate, totalDone } = stat

  const firstDate = last30days[0] ? new Date(last30days[0].date + 'T12:00:00') : new Date()
  const startDow = firstDate.getDay()
  const padded: (RoutineStatDay | null)[] = [
    ...Array(startDow).fill(null),
    ...last30days,
  ]
  while (padded.length % 7 !== 0) padded.push(null)

  const weeks: (RoutineStatDay | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{routine.name}</p>
          <p className="text-xs text-muted">{TIME_LABELS[routine.time_of_day] ?? routine.time_of_day}</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-xl font-bold text-accent-600 dark:text-accent-400">{completionRate}%</p>
            <p className="text-[11px] text-muted">30 días</p>
          </div>
          <div>
            <p className="text-xl font-bold text-text">{totalDone}</p>
            <p className="text-[11px] text-muted">completadas</p>
          </div>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_INITIALS.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted">{d}</div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} />
              return (
                <div
                  key={di}
                  title={day.date}
                  className={[
                    'aspect-square rounded-sm transition-colors',
                    day.completed
                      ? 'bg-accent-600 dark:bg-accent-500 opacity-85'
                      : 'border border-border bg-surface-elevated',
                  ].join(' ')}
                />
              )
            })}
          </div>
        ))}
      </div>
    </article>
  )
}

interface RoutineStatsViewProps {
  stats: RoutineStats[]
}

export function RoutineStatsView({ stats }: RoutineStatsViewProps) {
  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-text">Sin rutinas configuradas</p>
        <p className="mt-1 text-sm text-muted">Creá tus primeras rutinas para ver estadísticas.</p>
      </div>
    )
  }

  const avg = Math.round(stats.reduce((a, s) => a + s.completionRate, 0) / stats.length)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
        <div>
          <p className="text-xs text-muted">Promedio general</p>
          <p className="text-2xl font-bold text-text">{avg}%</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-accent-600 transition-all"
            style={{ width: `${avg}%` }}
          />
        </div>
        <p className="text-xs text-muted">últimos 30 días</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <RoutineHeatmap key={stat.routine.id} stat={stat} />
        ))}
      </div>
    </div>
  )
}
