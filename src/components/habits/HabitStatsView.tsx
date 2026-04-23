'use client'

import { HABIT_COLOR_STYLES, DAY_NAMES_SHORT } from '@/types/habits'
import type { HabitWithLogs, HabitDay } from '@/types/habits'

const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function getCompletionRate(days: HabitDay[]): number {
  const due = days.filter((d) => d.isDue)
  if (due.length === 0) return 0
  return Math.round((due.filter((d) => d.completed).length / due.length) * 100)
}

function HabitHeatmap({ item }: { item: HabitWithLogs }) {
  const { habit, last30days, streak } = item
  const styles = HABIT_COLOR_STYLES[habit.color]
  const rate = getCompletionRate(last30days)

  // Pad to start on the correct weekday of the first entry
  const firstDate = last30days[0] ? new Date(last30days[0].date + 'T12:00:00') : new Date()
  const startDow = firstDate.getDay() // 0=Sun
  const padded: (HabitDay | null)[] = [
    ...Array(startDow).fill(null),
    ...last30days,
  ]
  // Fill to complete last row
  while (padded.length % 7 !== 0) padded.push(null)

  const weeks: (HabitDay | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {habit.icon && <span className="text-lg">{habit.icon}</span>}
          <div>
            <p className="text-sm font-semibold text-text">{habit.name}</p>
            <p className="text-xs text-muted capitalize">{habit.frequency === 'daily' ? 'Todos los días' : habit.frequency === 'weekdays' ? 'Días de semana' : 'Semanal'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className={`text-xl font-bold ${styles.text}`}>{rate}%</p>
            <p className="text-[11px] text-muted">últimos 30 días</p>
          </div>
          <div>
            <p className="text-xl font-bold text-text">{streak}</p>
            <p className="text-[11px] text-muted">racha</p>
          </div>
        </div>
      </div>

      {/* Day-of-week header */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_INITIALS.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted">{d}</div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (!day) return <div key={di} />
              if (!day.isDue) {
                return (
                  <div
                    key={di}
                    title={day.date}
                    className="aspect-square rounded-sm bg-surface-2 opacity-30"
                  />
                )
              }
              if (day.completed) {
                return (
                  <div
                    key={di}
                    title={`${day.date} ✓`}
                    className={`aspect-square rounded-sm ${styles.bg} opacity-85`}
                  />
                )
              }
              return (
                <div
                  key={di}
                  title={`${day.date} —`}
                  className="aspect-square rounded-sm border border-border bg-surface-2"
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${styles.bg} opacity-85`} />
          Cumplido
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-border bg-surface-2" />
          Perdido
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-surface-2 opacity-30" />
          No aplica
        </span>
      </div>
    </article>
  )
}

interface HabitStatsViewProps {
  items: HabitWithLogs[]
}

export function HabitStatsView({ items }: HabitStatsViewProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-text">Sin hábitos configurados</p>
        <p className="mt-1 text-sm text-muted">Creá tus primeros hábitos para ver estadísticas.</p>
      </div>
    )
  }

  const overall = items.map((item) => getCompletionRate(item.last30days))
  const avg = Math.round(overall.reduce((a, b) => a + b, 0) / overall.length)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
        <div>
          <p className="text-xs text-muted">Promedio general</p>
          <p className="text-2xl font-bold text-text">{avg}%</p>
        </div>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent-600 transition-all"
            style={{ width: `${avg}%` }}
          />
        </div>
        <p className="text-xs text-muted">últimos 30 días</p>
      </div>

      {/* Per-habit heatmaps */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <HabitHeatmap key={item.habit.id} item={item} />
        ))}
      </div>
    </div>
  )
}
