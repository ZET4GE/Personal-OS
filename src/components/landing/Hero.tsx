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
          <Reveal className="relative" distance={20}>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-accent-500/20 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
              <Sparkles size={12} className="shrink-0" />
              Work in One Framework
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-text sm:text-5xl lg:text-[4.5rem] lg:leading-[0.95]">
              Menos apps sueltas.
              <span className="mt-2 block bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-500 bg-clip-text text-transparent dark:from-accent-400 dark:via-cyan-300 dark:to-violet-400">
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
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-100/55 px-6 py-3 text-sm font-semibold text-text shadow-[0_18px_32px_-26px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_42px_-28px_rgba(15,23,42,0.2)] active:scale-[0.98] dark:border-white/10 dark:bg-surface/70 dark:shadow-[var(--shadow-card)] dark:hover:border-border-bright dark:hover:shadow-[var(--shadow-card-hover)]"
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
                  <div className="rounded-2xl border border-slate-200/50 bg-slate-50/55 p-4 shadow-[0_16px_34px_-26px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-transform duration-200 ease-out hover:-translate-y-1 dark:border-white/10 dark:bg-surface/65 dark:shadow-none">
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

          <Reveal delayMs={100} distance={22}>
            <div className="relative lg:pl-6">
              <div className="absolute inset-x-12 top-8 h-32 rounded-full bg-gradient-to-r from-accent-500/12 via-cyan-500/8 to-violet-500/10 blur-3xl dark:from-accent-500/25 dark:via-cyan-500/10 dark:to-violet-500/20" />
              <HeroShowcase />
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={180} className="mt-16" distance={20}>
          <div className="grid gap-4 rounded-[2rem] border border-slate-200/50 bg-slate-50/40 p-4 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/55 dark:shadow-none sm:grid-cols-3 sm:p-5">
            {[
              ['Para estudiantes', 'Roadmaps, cursos, CV y habitos sin perder el hilo.'],
              ['Para freelancers', 'Clientes, proyectos, finanzas y seguimiento del trabajo en un solo flujo.'],
              ['Para profesionales', 'Tu perfil publico, progreso real y todo listo para mostrar.'],
            ].map(([title, description], index) => (
              <div
                key={title}
                className={[
                  'rounded-2xl border border-slate-200/50 bg-slate-50/45 p-4 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.15)] transition-transform duration-200 ease-out hover:-translate-y-1 dark:border-white/8 dark:bg-black/[0.14] dark:shadow-none',
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
