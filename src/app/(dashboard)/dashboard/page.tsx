import type { Metadata } from 'next'
import Link from 'next/link'
import { Briefcase, FolderOpen, TrendingUp, Bell, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/services/jobs'
import { getProjects } from '@/services/projects'
import { JOB_STATUS_LABELS, JOB_STATUS_STYLES } from '@/types/jobs'
import type { JobApplication } from '@/types/jobs'

export const metadata: Metadata = { title: 'Dashboard' }

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(
    new Date(isoString),
  )
}

function isThisMonth(isoString: string): boolean {
  const d = new Date(isoString)
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth()
}

// ── Stat card ─────────────────────────────────────────────────

type IconColor = 'blue' | 'amber' | 'green' | 'purple'

const ICON_COLORS: Record<IconColor, { bg: string; text: string }> = {
  blue:   { bg: 'bg-blue-500/10   dark:bg-blue-500/15',   text: 'text-blue-600   dark:text-blue-400'   },
  amber:  { bg: 'bg-amber-500/10  dark:bg-amber-500/15',  text: 'text-amber-600  dark:text-amber-400'  },
  green:  { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  purple: { bg: 'bg-violet-500/10 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400' },
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label:  string
  value:  string
  sub:    string
  icon:   LucideIcon
  color:  IconColor
}) {
  const { bg, text } = ICON_COLORS[color]
  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={15} className={text} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted">{sub}</p>
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

  const totalJobs     = jobs.length
  const jobsThisMonth = jobs.filter((j) => isThisMonth(j.applied_at)).length
  const interviews    = jobs.filter((j) => j.status === 'interview').length
  const pendingOffers = jobs.filter((j) => j.status === 'offer').length
  const responded     = jobs.filter((j) => j.status !== 'applied').length
  const responseRate  = totalJobs > 0 ? Math.round((responded / totalJobs) * 100) : 0
  const activeProjects  = projects.filter((p) => p.status === 'in_progress').length
  const doneProjects    = projects.filter((p) => p.status === 'completed').length

  const recentJobs: JobApplication[] = jobs.slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Resumen
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Empleos postulados"
            value={String(totalJobs)}
            sub={jobsThisMonth > 0 ? `+${jobsThisMonth} este mes` : 'Sin postulaciones este mes'}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            label="Entrevistas"
            value={String(interviews)}
            sub={pendingOffers > 0 ? `${pendingOffers} oferta${pendingOffers > 1 ? 's' : ''}` : 'Sin ofertas pendientes'}
            icon={Bell}
            color="amber"
          />
          <StatCard
            label="Proyectos activos"
            value={String(activeProjects)}
            sub={doneProjects > 0 ? `${doneProjects} completado${doneProjects > 1 ? 's' : ''}` : 'Sin proyectos completados'}
            icon={FolderOpen}
            color="green"
          />
          <StatCard
            label="Tasa de respuesta"
            value={`${responseRate}%`}
            sub={totalJobs > 0 ? `${responded} de ${totalJobs} respondidos` : 'Sin datos todavía'}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      </section>

      {/* Recent jobs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Empleos recientes
          </h2>
          {totalJobs > 5 && (
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs text-accent-600 transition-colors hover:text-accent-700 dark:text-accent-400"
            >
              Ver todos <ArrowUpRight size={12} />
            </Link>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-14 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Briefcase size={20} className="text-muted" />
            </span>
            <p className="text-sm font-medium">No hay postulaciones todavía</p>
            <p className="mt-1 text-xs text-muted">Registra tu primera búsqueda laboral.</p>
            <Link
              href="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              Agregar empleo
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
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
                    className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 font-medium">{job.company}</td>
                    <td className="px-4 py-3 text-muted">{job.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${JOB_STATUS_STYLES[job.status]}`}>
                        {JOB_STATUS_LABELS[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted">
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
