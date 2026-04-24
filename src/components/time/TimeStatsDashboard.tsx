import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Crosshair, FolderOpen, Gauge, TimerReset } from 'lucide-react'
import { getTimeStats, type TimeStatsBreakdownItem, type TimeStatsDailyItem } from '@/services/time-stats'

interface TimeStatsDashboardProps {
  userId: string
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted">{helper}</p> : null}
    </div>
  )
}

function InsightCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-600/10 text-accent-500">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-text">{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function DailyChart({ items }: { items: TimeStatsDailyItem[] }) {
  const max = Math.max(...items.map((item) => item.totalSeconds), 1)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text">Semana productiva</h2>
          <p className="text-xs text-muted">Distribucion real de tiempo registrado.</p>
        </div>
        <Clock3 size={16} className="text-accent-500" />
      </div>
      <div className="flex h-44 items-end gap-2">
        {items.map((item) => {
          const height = Math.max(8, Math.round((item.totalSeconds / max) * 100))

          return (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end rounded-full bg-surface-elevated p-1">
                <div
                  className="w-full rounded-full bg-accent-600 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[11px] capitalize text-muted">{item.label}</span>
              <span className="text-[11px] font-medium text-text">{formatDuration(item.totalSeconds)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BreakdownList({
  title,
  icon,
  items,
  empty,
}: {
  title: string
  icon: ReactNode
  items: TimeStatsBreakdownItem[]
  empty: string
}) {
  const max = Math.max(...items.map((item) => item.totalSeconds), 1)

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-600/10 text-accent-500">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-text">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted">{empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium text-text">{item.title}</p>
                <span className="shrink-0 text-xs font-semibold text-text">{formatDuration(item.totalSeconds)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="h-full rounded-full bg-accent-600"
                  style={{ width: `${Math.max(4, (item.totalSeconds / max) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {item.sessions} {item.sessions === 1 ? 'sesion' : 'sesiones'} - {Math.round(item.share * 100)}% del total
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export async function TimeStatsDashboard({ userId }: TimeStatsDashboardProps) {
  const result = await getTimeStats(userId)
  const stats = result.data

  if (result.error || !stats) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
        {result.error ?? 'No se pudieron cargar las estadisticas de tiempo.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted">Time Tracking Pro</p>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Productividad real</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Revisa donde se fue tu tiempo, que metas recibieron avance y que sesiones quedaron sin asignar.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          Volver al foco
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Hoy" value={formatDuration(stats.todaySeconds)} />
        <MetricCard label="Semana" value={formatDuration(stats.weekSeconds)} />
        <MetricCard label="Mes" value={formatDuration(stats.monthSeconds)} />
        <MetricCard label="Total" value={formatDuration(stats.totalSeconds)} />
        <MetricCard label="Sesiones" value={String(stats.sessionCount)} />
        <MetricCard label="Promedio" value={formatDuration(stats.averageSessionSeconds)} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={<Gauge size={17} />}
          label="Score de foco"
          value={`${stats.focusScore}/100`}
          helper="Combina consistencia semanal y tiempo clasificado."
        />
        <InsightCard
          icon={<CheckCircle2 size={17} />}
          label="Clasificacion"
          value={formatPercent(stats.assignmentRate)}
          helper={stats.unassignedSeconds > 0
            ? `${formatDuration(stats.unassignedSeconds)} sin proyecto/meta.`
            : 'Todo el tiempo tiene destino.'}
        />
        <InsightCard
          icon={<BarChart3 size={17} />}
          label="Consistencia"
          value={`${stats.consistencyDays}/7 dias`}
          helper={`Ultimos 7 dias: ${formatDuration(stats.last7DaysSeconds)} registrados.`}
        />
        <InsightCard
          icon={<Clock3 size={17} />}
          label="Mejor dia"
          value={stats.bestDay ? `${stats.bestDay.label} - ${formatDuration(stats.bestDay.totalSeconds)}` : 'Sin datos'}
          helper={stats.bestDay ? `${stats.bestDay.sessions} sesiones registradas.` : 'Registra sesiones para ver patrones.'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <DailyChart items={stats.daily} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <BreakdownList
            title="Tiempo por proyecto"
            icon={<FolderOpen size={16} />}
            items={stats.byProject}
            empty="Todavia no hay tiempo asignado a proyectos."
          />
          <BreakdownList
            title="Tiempo por meta"
            icon={<Crosshair size={16} />}
            items={stats.byGoal}
            empty="Todavia no hay tiempo asignado a metas."
          />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-600/10 text-accent-500">
            <TimerReset size={16} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-text">Ultimas sesiones</h2>
            <p className="text-xs text-muted">Registro reciente del timer.</p>
          </div>
        </div>

        {stats.recentSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm font-medium text-text">Todavia no registraste sesiones.</p>
            <p className="mt-1 text-sm text-muted">Abri el timer y guarda tu primer bloque de trabajo.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentSessions.map((session) => (
              <div key={session.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {session.description || session.projectTitle || session.goalTitle || 'Sesion sin descripcion'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    {session.projectId && session.projectTitle ? (
                      <Link href="/projects" className="hover:text-foreground">
                        {session.projectTitle}
                      </Link>
                    ) : null}
                    {session.projectId && session.goalId ? <span>/</span> : null}
                    {session.goalId && session.goalTitle ? (
                      <Link href={`/goals/${session.goalId}`} className="hover:text-foreground">
                        {session.goalTitle}
                      </Link>
                    ) : null}
                    {!session.projectId && !session.goalId ? <span>Sin asignacion</span> : null}
                    <span>-</span>
                    <span>{formatSessionDate(session.startedAt)}</span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-text">
                  {formatDuration(session.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
