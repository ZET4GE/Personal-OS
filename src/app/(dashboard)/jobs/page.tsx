import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJobTrackerStats, getJobs } from '@/services/jobs'
import { JobsClient } from '@/components/jobs/JobsClient'
import { JOB_STATUS_LABELS, JOB_STATUSES } from '@/types/jobs'
import type { JobStatus, JobTrackerStats } from '@/types/jobs'

export const metadata: Metadata = { title: 'Empleos' }

// ─────────────────────────────────────────────────────────────
// Tipos — searchParams es Promise en Next.js 16
// ─────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function JobsPage({ searchParams }: PageProps) {
  const { status } = await searchParams

  // Validar que el status sea un valor conocido
  const statusFilter = JOB_STATUSES.includes(status as JobStatus)
    ? (status as JobStatus)
    : undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [jobsResult, statsResult] = await Promise.all([
    getJobs(supabase, user.id, statusFilter),
    getJobTrackerStats(supabase, user.id),
  ])

  const stats: JobTrackerStats =
    statsResult.data ?? {
      total_jobs: 0,
      active_applications: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
      upcoming_interviews: 0,
      overdue_followups: 0,
      response_rate: 0,
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Seguimiento de empleos</h2>
        <p className="text-sm text-muted">Registra y da seguimiento a tus postulaciones.</p>
      </div>

      {/* Filtros por status — links del servidor, sin JS */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por estado">
        <FilterTab href="/jobs" active={!statusFilter} label="Todos" />
        {JOB_STATUSES.map((s) => (
          <FilterTab
            key={s}
            href={`/jobs?status=${s}`}
            active={statusFilter === s}
            label={JOB_STATUS_LABELS[s]}
          />
        ))}
      </nav>

      {/* Lista con optimistic updates */}
      <JobsClient jobs={jobsResult.data ?? []} stats={stats} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Filter tab — Server Component (solo un Link)
// ─────────────────────────────────────────────────────────────

function FilterTab({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}
