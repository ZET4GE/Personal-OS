import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronLeft, CalendarDays, Flag, GitBranch, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoal } from '@/services/goals'
import { getGoalDetail, getGoalDetailProgress } from '@/services/goal-detail'
import { getRoadmapsByGoalId } from '@/services/learning-roadmaps'
import { GoalProgress } from '@/components/goals/GoalProgress'
import { GoalDetail } from '@/components/goals/GoalDetail'
import { CategoryBadge } from '@/components/goals/CategoryBadge'
import { MilestoneList } from '@/components/goals/MilestoneList'
import { GoalTimeline } from '@/components/goals/GoalTimeline'
import { GoalUpdateForm } from '@/components/goals/GoalUpdateForm'
import { GoalStatusActions } from '@/components/goals/GoalStatusActions'
import { TagSelector } from '@/components/tags/TagSelector'
import {
  GOAL_COLOR_STYLES, PRIORITY_META,
} from '@/types/goals'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { title: 'Meta' }

  const result = await getGoal(supabase, user.id, id)
  return { title: result.data?.title ?? 'Meta' }
}

export default async function GoalDetailPage({
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

  const [detailResult, progressResult, roadmapsResult] = await Promise.all([
    getGoalDetail(supabase, user.id, id),
    getGoalDetailProgress(supabase, id),
    getRoadmapsByGoalId(supabase, user.id, id),
  ])

  if (!detailResult.data || !progressResult.data) notFound()

  const goal       = result.data
  const milestones = goal.milestones   ?? []
  const updates    = goal.goal_updates ?? []
  const styles     = GOAL_COLOR_STYLES[goal.color] ?? GOAL_COLOR_STYLES.blue
  const priority   = PRIORITY_META[goal.priority]
  const detail     = detailResult.data
  const progress   = progressResult.data
  const roadmaps   = roadmapsResult.data ?? []

  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <div className="mx-auto max-w-4xl animate-fade-in pb-8 space-y-6">
      {/* Back */}
      <Link
        href="/goals"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeft size={15} />
        Volver a Metas
      </Link>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {/* Color bar */}
        <div className={`absolute inset-x-0 top-0 h-[3px] ${styles.bar} opacity-70`} />
        {/* Ambient glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-accent-600/[0.04] blur-3xl -z-0" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Left: info */}
          <div className="flex-1 space-y-4 min-w-0">
            <div className="flex items-start gap-3">
              {goal.icon && <span className="text-3xl shrink-0">{goal.icon}</span>}
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-text leading-tight">{goal.title}</h1>
                {goal.description && (
                  <p className="mt-1 text-sm text-muted leading-relaxed">{goal.description}</p>
                )}
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={goal.category} size="md" />
              <span className={`text-xs font-medium ${priority.color}`}>
                <Flag size={11} className="inline mr-1" />
                {priority.label} prioridad
              </span>
              {daysLeft !== null && (
                <span className={`flex items-center gap-1 text-xs font-medium ${daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : 'text-muted'}`}>
                  <CalendarDays size={12} />
                  {daysLeft < 0
                    ? `Venció hace ${Math.abs(daysLeft)} días`
                    : daysLeft === 0
                    ? 'Vence hoy'
                    : `${daysLeft} días restantes`}
                </span>
              )}
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  goal.status === 'active'    ? 'bg-blue-500/10 text-blue-500' :
                  goal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                  goal.status === 'paused'    ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500',
                ].join(' ')}
              >
                {goal.status === 'active'    ? 'Activa'     :
                 goal.status === 'completed' ? 'Completada' :
                 goal.status === 'paused'    ? 'Pausada'    : 'Abandonada'}
              </span>
            </div>

            {/* Status actions */}
            <GoalStatusActions goal={goal} />
          </div>

          {/* Right: circular progress */}
          <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
            <GoalProgress
              progress={progress.progress}
              size={130}
              stroke={10}
              color={styles.text}
            />
            <div className="flex items-center gap-2">
              <TagSelector entityId={goal.id} entityType="goal" align="right" />
              <Link
                href={`/goals/${id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-bright hover:text-foreground"
              >
                <Pencil size={12} />
                Editar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <GoalDetail detail={detail} progress={progress} />

      {/* Linked roadmaps */}
      {roadmaps.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <GitBranch size={14} className="text-accent-600 dark:text-accent-400" />
            Roadmaps vinculados
          </h3>
          <div className="space-y-2">
            {roadmaps.map((roadmap) => (
              <Link
                key={roadmap.id}
                href={`/roadmaps/${roadmap.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3 transition-all hover:border-border-bright hover:bg-surface-hover"
              >
                <span className="text-sm font-medium text-text">{roadmap.title}</span>
                <span className="text-xs text-muted capitalize">
                  {roadmap.type === 'free' ? 'Libre' : roadmap.type === 'structured' ? 'Guiado' : 'Basado en meta'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two columns: milestones + timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Milestones */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <MilestoneList goalId={goal.id} milestones={milestones} />
        </div>

        {/* Updates */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold text-text mb-4">Nueva actualización</h3>
            <GoalUpdateForm goalId={goal.id} />
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold text-text mb-4">Historial</h3>
            <GoalTimeline updates={updates} milestones={milestones} />
          </div>
        </div>
      </div>
    </div>
  )
}
