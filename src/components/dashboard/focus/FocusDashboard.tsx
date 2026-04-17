import Link from 'next/link'
import { ArrowRight, Clock, Crosshair, GitBranch, NotebookText, Search, Target } from 'lucide-react'
import type { DashboardData } from '@/types/dashboard'
import type { Goal } from '@/types/goals'

interface FocusDashboardProps {
  activeGoal: Goal | null
  dashboardData: DashboardData
}

function formatHours(seconds: number | null | undefined) {
  const hours = Math.round(((seconds ?? 0) / 3600) * 10) / 10
  return `${hours}h`
}

function getGoalProgress(goal: Goal | null) {
  if (!goal) return 0
  if (goal.target_time && goal.target_time > 0) {
    return Math.min(100, Math.round(((goal.current_time ?? 0) / goal.target_time) * 100))
  }

  return Math.min(100, Math.round(Number(goal.progress ?? 0)))
}

function getNextAction(activeGoal: Goal | null, data: DashboardData) {
  const pendingHabit = data.todayHabits.habits.find((item) => !item.todayCompleted)
  if (pendingHabit) {
    return {
      label: pendingHabit.habit.name,
      origin: 'Habito de hoy',
      href: '/habits',
      cta: 'Marcar avance',
    }
  }

  const deadline = data.deadlines[0]
  if (deadline) {
    return {
      label: deadline.title,
      origin: 'Pendiente urgente',
      href: '/freelance',
      cta: 'Revisar entrega',
    }
  }

  if (activeGoal) {
    return {
      label: activeGoal.title,
      origin: 'Meta activa',
      href: `/goals/${activeGoal.id}`,
      cta: 'Continuar',
    }
  }

  return {
    label: 'Crea una meta para ordenar tu sistema',
    origin: 'Inicio guiado',
    href: '/goals',
    cta: 'Crear meta',
  }
}

export function FocusDashboard({ activeGoal, dashboardData }: FocusDashboardProps) {
  const goalProgress = getGoalProgress(activeGoal)
  const nextAction = getNextAction(activeGoal, dashboardData)
  const dueToday = dashboardData.todayHabits.dueToday
  const completedToday = dashboardData.todayHabits.completedToday
  const pendingToday = Math.max(dueToday - completedToday, 0)

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
      <div className="rounded-3xl border border-accent-600/25 bg-gradient-to-br from-accent-600/15 via-surface to-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-600/10 px-3 py-1 text-xs font-semibold text-accent-500">
              <Crosshair size={14} />
              Meta activa
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text">
              {activeGoal?.title ?? 'Todavia no hay una meta activa'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {activeGoal?.description ?? 'WINF funciona mejor cuando todo parte de una meta principal.'}
            </p>
          </div>

          <Link
            href={activeGoal ? `/goals/${activeGoal.id}` : '/goals'}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Continuar
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Progreso</p>
            <p className="mt-2 text-3xl font-semibold text-text">{goalProgress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-accent-600 transition-all" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Tiempo invertido</p>
            <p className="mt-2 text-3xl font-semibold text-text">{formatHours(activeGoal?.current_time)}</p>
            <p className="mt-2 text-xs text-muted">
              Objetivo: {activeGoal?.target_time ? formatHours(activeGoal.target_time) : 'sin definir'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Acciones de hoy</p>
            <p className="mt-2 text-3xl font-semibold text-text">{pendingToday}</p>
            <p className="mt-2 text-xs text-muted">{completedToday}/{dueToday} habitos hechos</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <Link
          href={nextAction.href}
          className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:scale-[1.01] hover:border-border-bright active:scale-[0.99]"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            <Target size={14} />
            Siguiente accion
          </div>
          <p className="text-lg font-semibold text-text">{nextAction.label}</p>
          <p className="mt-1 text-sm text-muted">{nextAction.origin}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-500">
            {nextAction.cta}
            <ArrowRight size={14} />
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">Acceso rapido</h2>
              <p className="text-xs text-muted">Usa lo necesario, no todo el sistema.</p>
            </div>
            <Clock size={17} className="text-accent-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/roadmaps" className="rounded-xl bg-surface-2 px-3 py-3 text-sm text-text transition-colors hover:bg-surface-hover">
              <GitBranch size={15} className="mb-2 text-cyan-400" />
              Roadmap
            </Link>
            <Link href="/notes" className="rounded-xl bg-surface-2 px-3 py-3 text-sm text-text transition-colors hover:bg-surface-hover">
              <NotebookText size={15} className="mb-2 text-amber-400" />
              Notas
            </Link>
            <Link href="/time" className="rounded-xl bg-surface-2 px-3 py-3 text-sm text-text transition-colors hover:bg-surface-hover">
              <Clock size={15} className="mb-2 text-emerald-400" />
              Tiempo
            </Link>
            <Link href="/search" className="rounded-xl bg-surface-2 px-3 py-3 text-sm text-text transition-colors hover:bg-surface-hover">
              <Search size={15} className="mb-2 text-violet-400" />
              Buscar
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
