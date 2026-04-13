import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getClients } from '@/services/clients'
import { ClientsClient } from '@/components/clients/ClientsClient'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await getClients(supabase)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Clientes</h2>
        <p className="text-sm text-muted">Gestiona tus clientes y accede a sus proyectos.</p>
      </div>
      <ClientsClient clients={clients ?? []} />
    </div>
  )
}
