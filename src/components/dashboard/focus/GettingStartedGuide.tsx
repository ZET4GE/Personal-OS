import Link from 'next/link'
import { ArrowRight, Check, Clock3, Crosshair, GitBranch, ListTodo, Settings } from 'lucide-react'

interface GettingStartedGuideProps {
  hasActiveGoal: boolean
  hasRoadmap: boolean
  hasActionSystem: boolean
  hasTimeEntry: boolean
  hasConfiguredModules: boolean
}

const ITEMS = [
  {
    key: 'goal',
    title: 'Elegir meta activa',
    description: 'Define que queres lograr primero.',
    href: '/goals',
    icon: Crosshair,
  },
  {
    key: 'roadmap',
    title: 'Crear camino',
    description: 'Divide la meta en pasos claros.',
    href: '/roadmaps',
    icon: GitBranch,
  },
  {
    key: 'actions',
    title: 'Preparar acciones',
    description: 'Crea proyecto, habito o rutina.',
    href: '/dashboard',
    icon: ListTodo,
  },
  {
    key: 'time',
    title: 'Registrar tiempo',
    description: 'Medi avance real con una sesion.',
    href: '/time',
    icon: Clock3,
  },
  {
    key: 'modules',
    title: 'Simplificar modulos',
    description: 'Oculta lo que no uses.',
    href: '/settings/preferences',
    icon: Settings,
  },
] as const

export function GettingStartedGuide({
  hasActiveGoal,
  hasRoadmap,
  hasActionSystem,
  hasTimeEntry,
  hasConfiguredModules,
}: GettingStartedGuideProps) {
  const doneByKey = {
    goal: hasActiveGoal,
    roadmap: hasRoadmap,
    actions: hasActionSystem,
    time: hasTimeEntry,
    modules: hasConfiguredModules,
  }
  const completed = ITEMS.filter((item) => doneByKey[item.key]).length
  const nextItem = ITEMS.find((item) => !doneByKey[item.key])

  if (!nextItem) {
    return (
      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Sistema inicial listo
            </p>
            <p className="mt-1 text-sm text-text">
              Ya tenes meta, camino, acciones, tiempo y modulos configurados.
            </p>
          </div>
          <Link
            href="/settings/preferences"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 transition-colors hover:text-emerald-200"
          >
            Ajustar modulos
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    )
  }

  const NextIcon = nextItem.icon

  return (
    <section className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
            Primeros pasos
          </p>
          <h2 className="mt-1 text-lg font-semibold text-text">Tu siguiente paso recomendado</h2>
          <p className="mt-1 text-sm text-muted">
            WINF funciona mejor si avanzas en este orden: meta, camino, accion y tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-text">{completed}/{ITEMS.length}</p>
            <p className="text-xs text-muted">configurado</p>
          </div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full bg-accent-500"
              style={{ width: `${(completed / ITEMS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1.4fr]">
        <Link
          href={nextItem.href}
          className="group rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4 transition hover:border-accent-400/70"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-600 text-white">
              <NextIcon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">{nextItem.title}</p>
              <p className="mt-1 text-sm text-muted">{nextItem.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-400">
                Continuar
                <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ITEMS.map((item) => {
            const Icon = item.icon
            const done = doneByKey[item.key]

            return (
              <Link
                key={item.key}
                href={item.href}
                className={[
                  'rounded-2xl border p-3 transition hover:-translate-y-0.5',
                  done
                    ? 'border-emerald-500/20 bg-emerald-500/10'
                    : item.key === nextItem.key
                      ? 'border-accent-500/30 bg-surface-elevated'
                      : 'border-border bg-surface-elevated hover:border-border-bright',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon size={15} className={done ? 'text-emerald-400' : 'text-muted'} />
                  {done ? <Check size={14} className="text-emerald-400" /> : null}
                </div>
                <p className="mt-3 text-xs font-medium text-text">{item.title}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
