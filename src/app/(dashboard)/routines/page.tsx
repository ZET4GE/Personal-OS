import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getRoutinesWithStatus } from '@/services/routines'
import { RoutinesClient } from '@/components/routines/RoutinesClient'

export const metadata: Metadata = { title: 'Rutinas' }

export default async function RoutinesPage() {
  const today    = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: routines } = await getRoutinesWithStatus(supabase, user.id, today)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Rutinas</h2>
        <p className="text-sm text-muted">Tus rutinas del día de hoy.</p>
      </div>

      <RoutinesClient routines={routines ?? []} date={today} />
    </div>
  )
}
