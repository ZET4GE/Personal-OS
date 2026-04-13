import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHabits } from '@/services/habits'
import { ManageHabitsClient } from '@/components/habits/ManageHabitsClient'

export const metadata: Metadata = { title: 'Gestionar hábitos' }

export default async function ManageHabitsPage() {
  const supabase = await createClient()
  const { data: habits } = await getHabits(supabase)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/habits"
          className="mb-3 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} /> Hábitos
        </Link>
        <h2 className="text-lg font-semibold">Gestionar hábitos</h2>
        <p className="text-sm text-muted">Crea, edita y organiza tus hábitos.</p>
      </div>

      <ManageHabitsClient habits={habits ?? []} />
    </div>
  )
}
