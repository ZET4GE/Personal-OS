'use client'

import { Clock3, Globe2, GitBranch, Target } from 'lucide-react'
import { Reveal } from './Reveal'

const STEPS = [
  {
    icon: Target,
    step: '01',
    title: 'Elegís una meta',
    desc: 'Una sola. Clara, medible. WINF organiza todo lo demás a partir de ella.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: GitBranch,
    step: '02',
    title: 'Creás el camino',
    desc: 'Dividís la meta en etapas con un roadmap. Cada nodo es un paso concreto.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Clock3,
    step: '03',
    title: 'Ejecutás y medís',
    desc: 'Hábitos, proyectos y timer registran cuánto tiempo real dedicás a avanzar.',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    border: 'border-accent-500/20',
  },
  {
    icon: Globe2,
    step: '04',
    title: 'Mostrás el progreso',
    desc: 'Tu perfil público refleja lo que lograste. CV, proyectos y roadmaps en un solo lugar.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 text-center" distance={20}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 dark:text-accent-400">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">
            Un sistema, no una lista de apps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            WINF conecta metas, roadmaps, tiempo y perfil en un loop que avanza solo cuando vos avanzás.
          </p>
        </Reveal>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Línea conectora — solo desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          {STEPS.map((s, i) => (
            <Reveal key={s.step} distance={18} delayMs={i * 70}>
              <div className={`relative rounded-2xl border ${s.border} ${s.bg} p-5 backdrop-blur-sm`}>
                {/* Número */}
                <span className={`text-[11px] font-bold tracking-[0.2em] ${s.color} opacity-60`}>
                  {s.step}
                </span>

                {/* Ícono */}
                <div className={`mt-3 flex h-11 w-11 items-center justify-center rounded-xl ${s.bg} border ${s.border}`}>
                  <s.icon size={20} className={s.color} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.desc}</p>

                {/* Flecha derecha — solo entre cards en desktop */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 top-10 hidden text-border lg:block"
                  >
                    →
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
