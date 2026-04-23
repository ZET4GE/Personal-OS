import { FolderOpen, PenLine, Target, Users } from 'lucide-react'
import { Reveal } from './Reveal'

const STATS = [
  {
    icon: Users,
    value: '100+',
    label: 'Profesionales organizando su trabajo',
    color: 'text-blue-500 dark:text-blue-300',
    glow: 'from-blue-500/16 to-cyan-500/8',
  },
  {
    icon: FolderOpen,
    value: '500+',
    label: 'Proyectos creados en WINF',
    color: 'text-violet-500 dark:text-violet-300',
    glow: 'from-violet-500/16 to-fuchsia-500/8',
  },
  {
    icon: PenLine,
    value: '1000+',
    label: 'Notas y articulos publicados',
    color: 'text-amber-500 dark:text-amber-300',
    glow: 'from-amber-500/16 to-orange-500/8',
  },
  {
    icon: Target,
    value: '50k+',
    label: 'Habitos registrados y medidos',
    color: 'text-emerald-500 dark:text-emerald-300',
    glow: 'from-emerald-500/16 to-teal-500/8',
  },
] as const

export function SocialProof() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal distance={18}>
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/75 bg-white/52 p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/55 dark:shadow-none sm:p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/55 to-transparent dark:from-white/5" />
            <div className="absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-accent-500/10 blur-3xl dark:bg-accent-500/15" />
            <div className="absolute -right-12 top-8 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/12" />

            <div className="relative">
              <div className="mb-6 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Prueba social</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text sm:text-2xl lg:text-[1.75rem]">
                    Creado para gente que necesita orden sin matar impulso.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted">
                  La idea no es llenar un dashboard. Es tener una estructura que se mueva con vos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {STATS.map((stat, index) => (
                  <Reveal key={stat.label} delayMs={70 * (index + 1)} distance={16}>
                    <div className="group relative h-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/62 p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 dark:border-white/8 dark:bg-black/[0.14] dark:shadow-none sm:p-5">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.glow} opacity-80`} />
                      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/55 to-transparent dark:from-white/5" />

                      <div className="relative flex h-full flex-col">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/72 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-black/15 dark:shadow-none ${stat.color}`}
                        >
                          <stat.icon size={18} />
                        </div>
                        <div className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-text sm:text-3xl">
                          {stat.value}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{stat.label}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
