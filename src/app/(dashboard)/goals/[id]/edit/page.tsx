import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoal } from '@/services/goals'
import { GoalForm } from '@/components/goals/GoalForm'

export const metadata: Metadata = { title: 'Editar meta' }

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getGoal(supabase, user.id, id)
  if (!result.data) notFound()

  const goal = result.data

  return (
    <div className="mx-auto max-w-2xl animate-fade-in pb-8">
      <Link
        href={`/goals/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} />
        Volver a la meta
      </Link>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text">Editar meta</h1>
          <p className="mt-1 text-sm text-muted">{goal.title}</p>
        </div>

        <GoalForm goal={goal} />
      </div>
    </div>
  )
}
