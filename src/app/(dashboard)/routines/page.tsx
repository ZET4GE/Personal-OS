import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoutinesWithStatus, getRoutineStats } from '@/services/routines'
import { RoutinesClient } from '@/components/routines/RoutinesClient'

export const metadata: Metadata = { title: 'Rutinas' }

export default async function RoutinesPage() {
  const today    = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: routines }, { data: stats }] = await Promise.all([
    getRoutinesWithStatus(supabase, user.id, today),
    getRoutineStats(supabase, user.id),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Rutinas</h2>
        <p className="text-sm text-muted">Tus rutinas del día de hoy.</p>
      </div>

      <RoutinesClient routines={routines ?? []} stats={stats ?? []} date={today} />
    </div>
  )
}
