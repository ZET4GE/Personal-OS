import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GoalForm } from '@/components/goals/GoalForm'

export const metadata: Metadata = { title: 'Nueva meta' }

export default async function NewGoalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl animate-fade-in pb-8">
      {/* Back link */}
      <Link
        href="/goals"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} />
        Volver a Metas
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text">Nueva meta</h1>
          <p className="mt-1 text-sm text-muted">
            Definí tu objetivo y los hitos para alcanzarlo
          </p>
        </div>

        <GoalForm />
      </div>
    </div>
  )
}
