import type { Metadata } from 'next'
import { Eye, Users, TrendingUp, BarChart3, Globe, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/services/profiles'
import { getAnalyticsSummary } from '@/services/analytics'
import { AnalyticsCard } from '@/components/analytics/AnalyticsCard'
import { ViewsChart } from '@/components/analytics/ViewsChart'
import { TopProjectsTable } from '@/components/analytics/TopProjectsTable'
import { PAGE_TYPE_LABELS } from '@/types/analytics'
import type { DateRange } from '@/types/analytics'

export const metadata: Metadata = { title: 'Analytics' }

// ─────────────────────────────────────────────────────────────
// Page — searchParams para filtro de rango
// ─────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ days?: string }>
}

const VALID_RANGES: DateRange[] = [7, 14, 30, 90]

function parseDays(raw: string | undefined): DateRange {
  const n = parseInt(raw ?? '30', 10)
  return (VALID_RANGES.includes(n as DateRange) ? n : 30) as DateRange
}

// ─────────────────────────────────────────────────────────────
// Range selector — Server Component (links, no JS)
// ─────────────────────────────────────────────────────────────

function RangeTab({ days, active, label }: { days: DateRange; active: boolean; label: string }) {
  return (
    <a
      href={`/analytics?days=${days}`}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {label}
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { days: daysParam } = await searchParams
  const days = parseDays(daysParam)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Perfil — necesitamos el username para los links
  const { data: profile } = await getMyProfile(supabase)
  const username = profile?.username ?? ''

  const summary = user
    ? await getAnalyticsSummary(supabase, user.id, days)
    : null

  const totalViews     = summary?.totalViews     ?? 0
  const uniqueVisitors = summary?.uniqueVisitors ?? 0
  const weeklyChange   = summary?.weeklyChange   ?? 0
  const dailyStats     = summary?.dailyStats     ?? []
  const topProjects    = summary?.topProjects    ?? []
  const byPageType     = summary?.byPageType     ?? { profile: 0, project: 0, cv: 0 }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted">
            Visitas a tu perfil público en los últimos {days} días.
          </p>
        </div>

        {/* Filtro de rango */}
        <nav className="flex flex-wrap gap-1.5" aria-label="Rango de fechas">
          <RangeTab days={7}  active={days === 7}  label="7 días" />
          <RangeTab days={14} active={days === 14} label="14 días" />
          <RangeTab days={30} active={days === 30} label="30 días" />
          <RangeTab days={90} active={days === 90} label="90 días" />
        </nav>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          label="Visitas totales"
          value={totalViews.toLocaleString()}
          sub={`Últimos ${days} días`}
          icon={Eye}
          accent
        />
        <AnalyticsCard
          label="Visitantes únicos"
          value={uniqueVisitors.toLocaleString()}
          sub="Por fingerprint anónimo"
          icon={Users}
        />
        <AnalyticsCard
          label="Tendencia semanal"
          value={`${weeklyChange > 0 ? '+' : ''}${weeklyChange}%`}
          sub={`Esta semana: ${summary?.viewsThisWeek ?? 0} · Anterior: ${summary?.viewsPrevWeek ?? 0}`}
          icon={TrendingUp}
          change={weeklyChange}
        />
      </div>

      {/* Gráfico de líneas */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Visitas por día
        </h3>
        <div className="rounded-xl border border-border bg-surface p-4">
          {totalViews === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              Aún no hay visitas registradas.
            </p>
          ) : (
            <ViewsChart data={dailyStats} days={days} />
          )}
        </div>
      </section>

      {/* Desglose + top proyectos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Desglose por tipo de página */}
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Por sección
          </h3>
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            {(
              [
                { type: 'profile' as const, icon: Users },
                { type: 'project' as const, icon: BarChart3 },
                { type: 'cv'      as const, icon: FileText },
              ] as const
            ).map(({ type, icon: Icon }) => {
              const count = byPageType[type]
              const pct   = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Icon size={14} className="text-muted" />
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{PAGE_TYPE_LABELS[type]}</span>
                      <span className="text-muted">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-accent-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {totalViews === 0 && (
              <p className="py-4 text-center text-sm text-muted">Sin datos todavía.</p>
            )}
          </div>
        </section>

        {/* Top proyectos */}
        <section>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
            Top proyectos
          </h3>
          <div className="rounded-xl border border-border bg-surface p-5">
            <TopProjectsTable projects={topProjects} username={username} />
          </div>
        </section>
      </div>

      {/* Hint de perfil público */}
      {!profile?.is_public && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          Tu perfil está configurado como privado. No recibirás visitas hasta que lo actives en{' '}
          <a href="/settings" className="font-medium underline underline-offset-2">
            Configuración
          </a>
          .
        </p>
      )}

      {/* Info de geo (solo Vercel) */}
      <p className="text-xs text-muted">
        <Globe size={12} className="mr-1 inline" />
        Los datos de país y ciudad están disponibles en producción (Vercel).
        En desarrollo solo se registra el fingerprint.
      </p>
    </div>
  )
}
