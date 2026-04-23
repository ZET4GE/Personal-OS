import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHabitsWithLogs } from '@/services/habits'
import { HabitsClient } from '@/components/habits/HabitsClient'
import { ModuleInfoCallout } from '@/components/ui/ModuleInfoCallout'

export const metadata: Metadata = { title: 'Hábitos' }

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function HabitsPage({ searchParams }: PageProps) {
  const { date: dateParam } = await searchParams
  const today    = new Date().toISOString().slice(0, 10)
  // Accept past dates only — reject future dates
  const date     = dateParam && dateParam <= today ? dateParam : today

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await getHabitsWithLogs(supabase, user.id, date)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hábitos</h2>
          <p className="text-sm text-muted">Seguimiento diario de tus hábitos.</p>
        </div>
        <Link
          href="/habits/manage"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800"
        >
          <Settings2 size={14} /> Gestionar
        </Link>
      </div>

        <ModuleInfoCallout storageKey="habits" title="¿Qué es un Hábito?">
        Un hábito es una <strong className="text-text">acción única y atómica</strong> que querés trackear diariamente.
        La pregunta es simple: ¿lo hiciste hoy? Sí o No.
        Se registra la racha, el historial y el porcentaje de cumplimiento.
        <br />
        <span className="mt-1 block">
          <strong className="text-text">Ejemplos:</strong> Meditar · Leer 30 min · Tomar agua · Ejercitar · No fumar.
        </span>
        <span className="mt-1 block text-blue-300">
          ¿Tenés varias acciones juntas en un bloque de tiempo? Eso es una <strong>Rutina</strong>, no un Hábito.
        </span>
      </ModuleInfoCallout>

    <HabitsClient items={items ?? []} date={date} />
    </div>
  )
}
