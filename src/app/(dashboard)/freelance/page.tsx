import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClientProjects } from '@/services/client-projects'
import { getClients } from '@/services/clients'
import { FreelanceClient } from '@/components/clients/FreelanceClient'
import { FreelanceStats } from '@/components/clients/FreelanceStats'
import { PROJECT_STATUSES_CLIENT, PROJECT_STATUS_CLIENT_LABELS } from '@/types/clients'
import type { ProjectStatusClient } from '@/types/clients'

export const metadata: Metadata = { title: 'Freelance' }

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function FreelancePage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const statusFilter = PROJECT_STATUSES_CLIENT.includes(status as ProjectStatusClient)
    ? (status as ProjectStatusClient)
    : undefined

  const supabase = await createClient()
  const [projectsResult, clientsResult, allResult] = await Promise.all([
    getClientProjects(supabase, statusFilter),
    getClients(supabase),
    getClientProjects(supabase),           // sin filtro, para stats
  ])

  const projects  = projectsResult.data ?? []
  const clients   = clientsResult.data  ?? []
  const allProjects = allResult.data ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Proyectos freelance</h2>
        <p className="text-sm text-muted">Seguimiento de proyectos, presupuestos y cobros.</p>
      </div>

      {/* Stats */}
      <FreelanceStats projects={allProjects} defaultCurrency="ARS" />

      {/* Filtros por status */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por estado">
        <FilterTab href="/freelance" active={!statusFilter} label="Todos" />
        {PROJECT_STATUSES_CLIENT.map((s) => (
          <FilterTab
            key={s}
            href={`/freelance?status=${s}`}
            active={statusFilter === s}
            label={PROJECT_STATUS_CLIENT_LABELS[s]}
          />
        ))}
      </nav>

      {/* Lista */}
      <FreelanceClient projects={projects} clients={clients} />
    </div>
  )
}

function FilterTab({ href, active, label }: { href: string; active: boolean; label: string }) {
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
