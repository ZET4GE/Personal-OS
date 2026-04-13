import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Mail, Phone, Building2, StickyNote } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClientById } from '@/services/clients'
import { getProjectsByClient } from '@/services/client-projects'
import { getClients } from '@/services/clients'
import { FreelanceClient } from '@/components/clients/FreelanceClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await getClientById(supabase, id)
  return { title: data ? `${data.name} · Clientes` : 'Cliente no encontrado' }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id }   = await params
  const supabase = await createClient()

  const [clientResult, projectsResult, allClientsResult] = await Promise.all([
    getClientById(supabase, id),
    getProjectsByClient(supabase, id),
    getClients(supabase),
  ])

  if (clientResult.error || !clientResult.data) notFound()
  const client   = clientResult.data
  const projects = projectsResult.data ?? []
  const clients  = allClientsResult.data ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <Link href="/clients" className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors">
        <ChevronLeft size={16} /> Clientes
      </Link>

      {/* Client header */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xl font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            {client.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{client.name}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {client.company && <span className="flex items-center gap-1.5"><Building2 size={13} /> {client.company}</span>}
              {client.email   && <span className="flex items-center gap-1.5"><Mail size={13} />     {client.email}</span>}
              {client.phone   && <span className="flex items-center gap-1.5"><Phone size={13} />    {client.phone}</span>}
            </div>
            {client.notes && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm text-muted dark:bg-slate-800">
                <StickyNote size={13} className="mt-0.5 shrink-0" /> {client.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Proyectos ({projects.length})
        </h3>
        <FreelanceClient projects={projects} clients={clients} />
      </section>
    </div>
  )
}
