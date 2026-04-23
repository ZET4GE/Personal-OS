import { FolderOpen, PenLine, Target, Users } from 'lucide-react'
import { Reveal } from './Reveal'

const STATS = [
  { icon: Users, value: '100+', label: 'Profesionales organizando su trabajo' },
  { icon: FolderOpen, value: '500+', label: 'Proyectos creados en WINF' },
  { icon: PenLine, value: '1000+', label: 'Notas y articulos publicados' },
  { icon: Target, value: '50k+', label: 'Habitos registrados y medidos' },
] as const

export function SocialProof() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal distance={18}>
          <div className="rounded-[2rem] border border-white/10 bg-surface/55 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Prueba social</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text sm:text-2xl">
                  Creado para gente que necesita orden sin matar impulso.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-muted">
                La idea no es llenar un dashboard. Es tener una estructura que se mueva con vos.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {STATS.map((stat, index) => (
                <Reveal key={stat.label} delayMs={70 * (index + 1)} distance={16}>
                  <div className="rounded-[1.5rem] border border-white/8 bg-black/[0.14] p-4 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-400">
                      <stat.icon size={18} />
                    </div>
                    <div className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text">{stat.value}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
