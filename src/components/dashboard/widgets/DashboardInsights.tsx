import { Lightbulb, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDashboardInsights } from '@/services/dashboard'

interface DashboardInsightsProps {
  userId: string
}

export async function DashboardInsights({ userId }: DashboardInsightsProps) {
  const supabase = await createClient()
  const insights = await getDashboardInsights(supabase, userId)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <Lightbulb size={14} className="text-amber-500" />
          </span>
          <h2 className="text-sm font-semibold text-text">Insights</h2>
        </div>
        <Link
          href="/goals"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Ver metas
          <ChevronRight size={12} />
        </Link>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted">
          No hay insights por ahora.
        </div>
      ) : (
        <div className="space-y-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-lg border border-border bg-surface-hover px-3 py-3 text-sm text-text"
            >
              {insight.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
