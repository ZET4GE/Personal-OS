import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClientProjectById } from '@/services/client-projects'
import { getPaymentsByProject } from '@/services/payments'
import { ProjectStatusBadge } from '@/components/clients/ProjectStatusBadge'
import { PaymentProgress } from '@/components/clients/PaymentProgress'
import { PaymentsClient } from '@/components/clients/PaymentsClient'
import { isOverdue, formatCurrency, formatDate } from '@/lib/utils'
import { PRIORITY_LABELS, PRIORITY_STYLES } from '@/types/clients'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await getClientProjectById(supabase, id)
  return { title: data ? `${data.title} · Freelance` : 'Proyecto no encontrado' }
}

export default async function FreelanceDetailPage({ params }: PageProps) {
  const { id }   = await params
  const supabase = await createClient()

  const [projectResult, paymentsResult] = await Promise.all([
    getClientProjectById(supabase, id),
    getPaymentsByProject(supabase, id),
  ])

  if (projectResult.error || !projectResult.data) notFound()
  const project  = projectResult.data
  const payments = paymentsResult.data ?? []
  const overdue  = isOverdue(project.due_date) && project.status !== 'completed' && project.status !== 'cancelled'

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Breadcrumb */}
      <Link href="/freelance" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
        <ChevronLeft size={16} /> Freelance
      </Link>

      {/* Project header */}
      <div className={[
        'rounded-xl border p-6 space-y-4',
        overdue ? 'border-red-200 dark:border-red-900' : 'border-border',
      ].join(' ')}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{project.title}</h2>
              <ProjectStatusBadge status={project.status} />
              {overdue && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                  <AlertCircle size={13} /> Vencido
                </span>
              )}
            </div>
            {project.client && (
              <Link href={`/clients/${project.client.id}`} className="text-sm text-muted hover:text-accent-600 transition-colors">
                {project.client.name}{project.client.company ? ` · ${project.client.company}` : ''}
              </Link>
            )}
          </div>
          <span className={`text-xs font-semibold ${PRIORITY_STYLES[project.priority]}`}>
            ● {PRIORITY_LABELS[project.priority]}
          </span>
        </div>

        {project.description && (
          <p className="text-sm text-muted leading-relaxed">{project.description}</p>
        )}

        {/* Fechas */}
        <div className="flex flex-wrap gap-4 text-sm">
          {project.start_date && (
            <span className="flex items-center gap-1.5 text-muted">
              <Calendar size={13} /> Inicio: {formatDate(project.start_date)}
            </span>
          )}
          {project.due_date && (
            <span className={`flex items-center gap-1.5 ${overdue ? 'text-red-500 font-medium' : 'text-muted'}`}>
              <Calendar size={13} /> Entrega: {formatDate(project.due_date)}
            </span>
          )}
          {project.completed_at && (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Calendar size={13} /> Completado: {formatDate(project.completed_at)}
            </span>
          )}
        </div>

        {/* Budget + progress */}
        {project.budget && (
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="mb-2 text-xs font-semibold text-muted uppercase tracking-wider">Presupuesto</p>
            <PaymentProgress
              paidAmount={project.paid_amount}
              budget={project.budget}
              currency={project.currency}
            />
          </div>
        )}
      </div>

      {/* Payments */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Historial de pagos
        </h3>
        <PaymentsClient
          payments={payments}
          projectId={project.id}
          defaultCurrency={project.currency}
          budget={project.budget}
        />
      </section>
    </div>
  )
}
