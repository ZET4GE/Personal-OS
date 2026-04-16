import Link from 'next/link'
import { PlayCircle, Sparkles } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'
import { AuthCTAButton } from './AuthCTAButton'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Background gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Top center glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-accent-600/8 blur-3xl dark:bg-accent-600/12" />
        {/* Bottom left */}
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl dark:bg-violet-600/10" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-600/20 bg-accent-600/5 px-3.5 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400">
            <Sparkles size={12} className="shrink-0" />
            WINF - Work in One Framework
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Cumpli tus metas con{' '}
            <span className="bg-gradient-to-r from-accent-500 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              un sistema guiado
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">
            Organiza metas, roadmaps, proyectos, habitos, tiempo y perfil publico.
            Todo conectado en un solo framework de trabajo.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <AuthCTAButton label="Comenzar gratis" mode="signup" />
            <Link
              href="/williams"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-text shadow-[var(--shadow-card)] transition-all hover:border-border-bright hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98]"
            >
              <PlayCircle size={15} className="text-accent-600" />
              Ver demo
            </Link>
          </div>

          {/* Social proof nudge */}
          <p className="mt-6 text-xs text-muted">
            Sin tarjeta de crédito · Sin límite de tiempo
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mt-16 sm:mt-20">
          {/* Glow behind mockup */}
          <div
            aria-hidden
            className="absolute -inset-x-4 -top-4 -bottom-8 rounded-3xl bg-gradient-to-b from-accent-600/5 to-transparent blur-xl dark:from-accent-600/10"
          />
          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
