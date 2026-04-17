import Link from 'next/link'
import { ChevronRight, Clock3, FolderOpen, Crosshair } from 'lucide-react'
import { getTimeStats } from '@/services/time-stats'

interface TimeInvestedWidgetProps {
  userId: string
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export async function TimeInvestedWidget({ userId }: TimeInvestedWidgetProps) {
  const result = await getTimeStats(userId)
  const stats = result.data ?? {
    todaySeconds: 0,
    weekSeconds: 0,
    totalSeconds: 0,
    sessionCount: 0,
    averageSessionSeconds: 0,
    unassignedSeconds: 0,
    daily: [],
    byProject: [],
    byGoal: [],
    recentSessions: [],
  }

  const topProject = stats.byProject[0]
  const topGoal = stats.byGoal[0]
  const maxDailySeconds = Math.max(...stats.daily.map((item) => item.totalSeconds), 1)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600/10">
            <Clock3 size={14} className="text-accent-600 dark:text-accent-400" />
          </span>
          <h2 className="text-sm font-semibold text-text">Tiempo invertido</h2>
        </div>
        <Link
          href="/time"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Ver mas
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-2 px-3 py-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Hoy</p>
          <p className="mt-1 text-sm font-semibold text-text">{formatDuration(stats.todaySeconds)}</p>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Semana</p>
          <p className="mt-1 text-sm font-semibold text-text">{formatDuration(stats.weekSeconds)}</p>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Total</p>
          <p className="mt-1 text-sm font-semibold text-text">{formatDuration(stats.totalSeconds)}</p>
        </div>
      </div>

      {stats.totalSeconds > 0 ? (
        <div className="rounded-xl bg-surface-2 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted">{stats.sessionCount} sesiones</span>
            <span className="font-medium text-text">Promedio {formatDuration(stats.averageSessionSeconds)}</span>
          </div>
          <div className="flex h-10 items-end gap-1">
            {stats.daily.map((item) => (
              <div key={item.date} className="flex flex-1 items-end rounded-full bg-surface-3">
                <div
                  className="w-full rounded-full bg-accent-600"
                  style={{ height: `${Math.max(8, (item.totalSeconds / maxDailySeconds) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result.error ? (
        <p className="text-xs text-red-500">{result.error}</p>
      ) : stats.totalSeconds === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted">Todavía no registraste tiempo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <FolderOpen size={14} className="text-accent-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Proyecto principal</p>
              <p className="truncate text-sm font-medium text-text">{topProject?.title ?? 'Sin proyecto'}</p>
            </div>
            <span className="text-xs font-semibold text-text">
              {formatDuration(topProject?.totalSeconds ?? 0)}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5">
            <Crosshair size={14} className="text-accent-600" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Meta principal</p>
              <p className="truncate text-sm font-medium text-text">{topGoal?.title ?? 'Sin meta'}</p>
            </div>
            <span className="text-xs font-semibold text-text">
              {formatDuration(topGoal?.totalSeconds ?? 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
