import Link from 'next/link'
import { ArrowRight, Orbit, PlayCircle, Sparkles, Target, TimerReset } from 'lucide-react'
import { AuthCTAButton } from './AuthCTAButton'
import { HeroShowcase } from './HeroShowcase'
import { Reveal } from './Reveal'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <Reveal className="relative" distance={34}>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-surface/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-400 backdrop-blur-xl">
              <Sparkles size={12} className="shrink-0" />
              Work in One Framework
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-text sm:text-5xl lg:text-[4.5rem] lg:leading-[0.95]">
              Menos apps sueltas.
              <span className="mt-2 block bg-gradient-to-r from-accent-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Mas claridad para cumplir una meta real.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              WINF convierte metas, roadmap, tiempo, habitos, proyectos y perfil publico
              en un mismo sistema vivo. No es otra dashboard generica: es una estructura
              para avanzar y mostrar progreso de verdad.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <AuthCTAButton label="Crear espacio gratis" mode="signup" />
              <Link
                href="/williams"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface/70 px-6 py-3 text-sm font-semibold text-text shadow-[var(--shadow-card)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98]"
              >
                <PlayCircle size={15} className="text-accent-500" />
                Ver demo en vivo
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Target,
                  label: 'Meta activa',
                  value: '1 foco claro',
                },
                {
                  icon: Orbit,
                  label: 'Roadmap conectado',
                  value: 'pasos visibles',
                },
                {
                  icon: TimerReset,
                  label: 'Tiempo real',
                  value: 'progreso medible',
                },
              ].map((item, index) => (
                <Reveal key={item.label} delayMs={80 + index * 90} distance={18}>
                  <div className="rounded-2xl border border-white/10 bg-surface/65 p-4 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                      <item.icon size={17} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-text">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.65)]" />
              Sin tarjeta al empezar
              <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
              Base gratuita real
              <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
              Tour guiado al entrar
            </div>
          </Reveal>

          <Reveal delayMs={120} distance={42}>
            <div className="relative lg:pl-6">
              <div className="absolute inset-x-12 top-8 h-32 rounded-full bg-gradient-to-r from-accent-500/25 via-cyan-500/10 to-violet-500/20 blur-3xl" />
              <HeroShowcase />
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={180} className="mt-16" distance={20}>
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-surface/55 p-4 backdrop-blur-xl sm:grid-cols-3 sm:p-5">
            {[
              ['Para estudiantes', 'Roadmaps, cursos, CV y habitos sin perder el hilo.'],
              ['Para freelancers', 'Clientes, proyectos, finanzas y seguimiento del trabajo en un solo flujo.'],
              ['Para profesionales', 'Tu perfil publico, progreso real y todo listo para mostrar.'],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={[
                  'rounded-2xl border border-white/8 bg-black/[0.14] p-4 transition-transform duration-300 hover:-translate-y-1',
                  index === 1 ? 'sm:scale-[1.02]' : '',
                ].join(' ')}
              >
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-400">
                  Entrar con foco
                  <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
