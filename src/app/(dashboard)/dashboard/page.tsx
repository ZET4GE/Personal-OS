import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, FolderOpen, TrendingUp, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/services/jobs'
import { getProjects } from '@/services/projects'
import { JOB_STATUS_LABELS, JOB_STATUS_STYLES } from '@/types/jobs'
import type { JobApplication } from '@/types/jobs'

export const metadata: Metadata = { title: 'Dashboard' }

// ── Helpers ───────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(
    new Date(isoString),
  )
}

function isThisMonth(isoString: string): boolean {
  const d = new Date(isoString)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

// ── Componentes locales ───────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  accent: boolean
}) {
  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-sm',
        accent
          ? 'border-accent-200 bg-accent-50 dark:border-accent-900 dark:bg-accent-950/30'
          : 'border-border bg-surface',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg',
            accent ? 'bg-accent-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
          ].join(' ')}
        >
          <Icon size={15} />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-0.5 text-xs text-muted">{sub}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()

  const [jobsResult, projectsResult] = await Promise.all([
    getJobs(supabase),
    getProjects(supabase),
  ])

  const jobs     = jobsResult.data     ?? []
  const projects = projectsResult.data ?? []

  // ── Estadísticas de empleos ──────────────────────────────────
  const totalJobs      = jobs.length
  const jobsThisMonth  = jobs.filter((j) => isThisMonth(j.applied_at)).length
  const interviews     = jobs.filter((j) => j.status === 'interview').length
  const pendingOffers  = jobs.filter((j) => j.status === 'offer').length

  // Tasa de respuesta = entrevistas + ofertas + rechazados sobre total
  const responded  = jobs.filter((j) => j.status !== 'applied').length
  const responseRate = totalJobs > 0 ? Math.round((responded / totalJobs) * 100) : 0

  // ── Estadísticas de proyectos ────────────────────────────────
  const activeProjects   = projects.filter((p) => p.status === 'in_progress').length
  const reviewProjects   = projects.filter((p) => p.status === 'completed').length

  // ── Jobs recientes (últimos 5) ────────────────────────────────
  const recentJobs: JobApplication[] = jobs.slice(0, 5)

  const STATS = [
    {
      label: 'Empleos postulados',
      value: String(totalJobs),
      sub: jobsThisMonth > 0 ? `+${jobsThisMonth} este mes` : 'Sin postulaciones este mes',
      icon: Briefcase,
      accent: true,
    },
    {
      label: 'Entrevistas',
      value: String(interviews),
      sub: pendingOffers > 0 ? `${pendingOffers} oferta${pendingOffers > 1 ? 's' : ''}` : 'Sin ofertas pendientes',
      icon: Bell,
      accent: false,
    },
    {
      label: 'Proyectos activos',
      value: String(activeProjects),
      sub: reviewProjects > 0 ? `${reviewProjects} completado${reviewProjects > 1 ? 's' : ''}` : 'Sin proyectos activos',
      icon: FolderOpen,
      accent: false,
    },
    {
      label: 'Tasa de respuesta',
      value: `${responseRate}%`,
      sub: totalJobs > 0 ? `${responded} de ${totalJobs} respondidos` : 'Sin datos todavía',
      icon: TrendingUp,
      accent: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Resumen
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Recent jobs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Empleos recientes
          </h2>
          {totalJobs > 5 && (
            <Link href="/jobs" className="text-xs text-muted transition-colors hover:text-foreground">
              Ver todos →
            </Link>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
            <p className="text-sm text-muted">No hay postulaciones todavía.</p>
            <Link
              href="/jobs"
              className="mt-3 inline-block rounded-lg bg-accent-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Agregar empleo
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-3 font-medium">{job.company}</td>
                    <td className="px-4 py-3 text-muted">{job.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_STYLES[job.status]}`}
                      >
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {formatDate(job.applied_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
