import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoutinesWithStatus, getRoutineStats } from '@/services/routines'
import { RoutinesClient } from '@/components/routines/RoutinesClient'
import { ModuleInfoCallout } from '@/components/ui/ModuleInfoCallout'

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

      <ModuleInfoCallout storageKey="routines" title="¿Qué es una Rutina y en qué se diferencia de un Hábito?">
        Una rutina es un <strong className="text-text">bloque de tiempo con varios pasos</strong> que ejecutás en secuencia.
        Tiene un momento del día (mañana, tarde, noche) y una lista de tareas que completás una por una.
        <br />
        <span className="mt-1 block">
          <strong className="text-text">Ejemplo:</strong> Rutina Mañana → [Meditar 10 min · Café · Revisar agenda · Revisar metas del día].
        </span>
        <span className="mt-1 block">
          Si solo querés registrar una sola acción (<em>"¿Lo hice hoy?"</em>), usá un <strong className="text-text">Hábito</strong>.
          Si es un bloque con varios pasos encadenados, usá una <strong className="text-text">Rutina</strong>.
        </span>
        <span className="mt-1 block text-blue-300">
          Tip: agregá los pasos desde el botón <strong>Gestionar</strong> → editá la rutina → sección "Pasos".
        </span>
      </ModuleInfoCallout>

      <RoutinesClient routines={routines ?? []} stats={stats ?? []} date={today} />
    </div>
  )
}
