import type { Metadata } from 'next'
import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  MapPin,
  Orbit,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { WINFLogo } from '@/components/brand/WINFLogo'
import { LandingBackground } from '@/components/landing/LandingBackground'
import { Reveal } from '@/components/landing/Reveal'
import { demoPortfolio, type DemoProject, type DemoRoadmapPhase, type DemoTone } from '@/data/demo/portfolio'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Demo publica | WINF',
  description: 'Portfolio demo publico de WINF con perfil, proyectos, roadmap y quick facts.',
}

const postDateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const toneClasses: Record<DemoTone, string> = {
  sky: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
  violet: 'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
}

const toneGlowClasses: Record<DemoTone, string> = {
  sky: 'from-sky-500/24 via-cyan-400/12 to-transparent',
  cyan: 'from-cyan-500/24 via-sky-400/12 to-transparent',
  violet: 'from-violet-500/24 via-fuchsia-400/12 to-transparent',
  emerald: 'from-emerald-500/24 via-teal-400/12 to-transparent',
}

const roadmapCompletion = Math.round(
  demoPortfolio.roadmap.reduce((total, phase) => total + phase.progress, 0) / demoPortfolio.roadmap.length,
)

function DemoShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-white/60 bg-white/72 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/72 dark:shadow-[var(--shadow-card-hover)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string; size?: number }>
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-surface/75 dark:text-accent-300">
        <Icon size={12} className="shrink-0" />
        {eyebrow}
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-text sm:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
    </div>
  )
}

function ProjectCard({ project }: { project: DemoProject }) {
  return (
    <DemoShell className="h-full p-4 sm:p-5">
      <div
        className={cn(
          'relative overflow-hidden rounded-[22px] border border-white/50 p-4 dark:border-white/10',
          'bg-gradient-to-br',
          toneGlowClasses[project.tone],
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                toneClasses[project.tone],
              )}
            >
              {project.stage}
            </span>
            <p className="mt-3 text-sm text-muted">{project.year}</p>
          </div>
          <div className="rounded-2xl border border-white/45 bg-white/60 px-3 py-2 text-right shadow-[0_10px_24px_-18px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-black/20 dark:shadow-none">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Impacto</p>
            <p className="mt-1 text-sm font-semibold text-text">{project.impact}</p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-text">{project.title}</h3>
          <span className="hidden rounded-full border border-border bg-white/70 px-2.5 py-1 text-[11px] font-medium text-muted dark:bg-surface/80 sm:inline-flex">
            WINF project
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{project.summary}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-surface/85 dark:text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-2.5">
        {project.wins.map((win) => (
          <div key={win} className="flex items-start gap-2.5 text-sm text-muted">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent-500" />
            <span>{win}</span>
          </div>
        ))}
      </div>
    </DemoShell>
  )
}

function RoadmapPhaseCard({ phase }: { phase: DemoRoadmapPhase }) {
  return (
    <div className="rounded-[24px] border border-white/55 bg-white/70 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-black/15 dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500">
            Phase {phase.phase}
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-text">{phase.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{phase.window}</p>
          <p className="mt-1 text-sm font-semibold text-text">{phase.progress}%</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">{phase.summary}</p>

      <div className="mt-4 h-2 rounded-full bg-slate-200/80 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500"
          style={{ width: `${phase.progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {phase.deliverables.map((item) => (
          <span
            key={item}
            className="rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-surface/80 dark:text-slate-200"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DemoPage() {
  return (
    <div id="top" className="landing-shell relative min-h-screen overflow-x-clip">
      <LandingBackground />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/72 backdrop-blur-xl dark:border-white/10 dark:bg-surface/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <WINFLogo
                markClassName="h-7 w-7 text-text"
                wordmarkClassName="text-sm font-semibold tracking-tight text-text"
              />
              <span className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600 dark:border-white/10 dark:bg-surface/80 dark:text-accent-300 sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.65)]" />
                Public demo
              </span>
            </Link>

            <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
              <a href="#projects" className="transition-colors hover:text-text">Projects</a>
              <a href="#roadmap" className="transition-colors hover:text-text">Roadmap</a>
              <a href="#writing" className="transition-colors hover:text-text">Writing</a>
            </nav>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-sm font-medium text-text shadow-[0_16px_32px_-24px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-surface/80 dark:shadow-none"
            >
              Landing
              <ArrowRight size={14} className="text-accent-500" />
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-5">
            <Reveal distance={28}>
              <DemoShell className="p-5 sm:p-7">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-400/18 via-sky-500/10 to-transparent blur-3xl dark:from-cyan-400/16 dark:via-sky-500/10" />
                <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/14 via-fuchsia-500/8 to-transparent blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-surface/75 dark:text-accent-300">
                    <Sparkles size={12} />
                    Portfolio WINF
                  </div>

                  <div className="mt-6 flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-sky-500 to-violet-500 blur-xl opacity-35" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-sky-500 via-cyan-400 to-violet-500 text-2xl font-semibold text-white shadow-[0_20px_40px_-24px_rgba(14,116,144,0.45)] sm:h-24 sm:w-24 sm:text-[1.75rem]">
                        MS
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-semibold tracking-[-0.05em] text-text sm:text-5xl">
                          {demoPortfolio.profile.name}
                        </h1>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
                          Open
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-muted sm:text-base">
                        @{demoPortfolio.profile.handle} / {demoPortfolio.profile.role}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="text-accent-500" />
                          {demoPortfolio.profile.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} className="text-accent-500" />
                          {demoPortfolio.profile.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-7 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-text sm:text-[3.35rem] sm:leading-[0.95]">
                    {demoPortfolio.profile.headline}
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    {demoPortfolio.profile.bio}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {demoPortfolio.profile.focus.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_12px_22px_-18px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-surface/85 dark:text-slate-200 dark:shadow-none"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {demoPortfolio.metrics.map((metric, index) => (
                      <Reveal key={metric.label} delayMs={70 + index * 80} distance={18}>
                        <div className="rounded-[22px] border border-white/55 bg-white/76 p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-black/15 dark:shadow-none">
                          <p className="text-2xl font-semibold tracking-[-0.04em] text-text">{metric.value}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted">{metric.detail}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#projects"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.55)] transition-all hover:-translate-y-0.5 hover:opacity-95"
                    >
                      Ver proyectos
                      <ChevronRight size={16} />
                    </a>
                    <a
                      href="#roadmap"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-text transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-surface/78"
                    >
                      Revisar roadmap
                      <Orbit size={16} className="text-accent-500" />
                    </a>
                  </div>
                </div>
              </DemoShell>
            </Reveal>

            <div className="grid gap-4">
              <Reveal delayMs={100} distance={28}>
                <DemoShell className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500">
                        Senales actuales
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">
                        Sistema publico coherente
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-white/55 bg-white/75 px-3 py-2 text-right dark:border-white/10 dark:bg-surface/78">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Roadmap</p>
                      <p className="mt-1 text-sm font-semibold text-text">{roadmapCompletion}% completo</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {demoPortfolio.signals.map((signal) => (
                      <div
                        key={signal.label}
                        className="flex items-center justify-between gap-4 rounded-[20px] border border-white/55 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-black/15"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-muted">{signal.label}</p>
                          <p className="mt-1 text-sm font-semibold text-text">{signal.value}</p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
                            toneClasses[signal.tone],
                          )}
                        >
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </DemoShell>
              </Reveal>

              <Reveal delayMs={180} distance={28}>
                <DemoShell className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500">
                    <TrendingUp size={13} />
                    Weekly flow
                  </div>
                  <div className="mt-4 space-y-3">
                    {demoPortfolio.weeklyFlow.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-[20px] border border-white/55 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-black/15"
                      >
                        <div>
                          <p className="text-sm font-semibold text-text">{item.label}</p>
                          <p className="mt-1 text-sm text-muted">{item.detail}</p>
                        </div>
                        <span className="text-sm font-semibold text-accent-600 dark:text-accent-300">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </DemoShell>
              </Reveal>
            </div>
          </section>

          <section id="projects" className="mt-14 sm:mt-16">
            <Reveal distance={22}>
              <SectionHeading
                icon={BriefcaseBusiness}
                eyebrow="Selected work"
                title="Proyectos con contexto, impacto y stack."
                description="La demo no muestra solo tarjetas lindas: cada bloque sugiere una historia de trabajo creible, con resultados, foco y decision making."
              />
            </Reveal>
            <div className="grid gap-4 lg:grid-cols-3">
              {demoPortfolio.projects.map((project, index) => (
                <Reveal key={project.title} delayMs={80 + index * 90} distance={18}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </section>

          <section
            id="roadmap"
            className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-5 sm:mt-16"
          >
            <Reveal distance={22}>
              <DemoShell className="p-5 sm:p-6">
                <SectionHeading
                  icon={Compass}
                  eyebrow="Roadmap summary"
                  title="Un plan visible para el siguiente salto."
                  description="En WINF el roadmap convive con proyectos, tiempos y contenido. Eso hace mas facil explicar en que etapa esta el trabajo y que viene despues."
                />

                <div className="space-y-4">
                  {demoPortfolio.roadmap.map((phase) => (
                    <RoadmapPhaseCard key={phase.phase} phase={phase} />
                  ))}
                </div>
              </DemoShell>
            </Reveal>

            <div className="grid gap-4">
              <Reveal delayMs={100} distance={22}>
                <DemoShell className="p-5 sm:p-6">
                  <SectionHeading
                    icon={FileText}
                    eyebrow="CV quick facts"
                    title="Senales rapidas para hiring o consultoria."
                    description="Resumen corto, legible en mobile y listo para validar fit sin tener que abrir otro documento."
                  />

                  <div className="grid gap-3">
                    {demoPortfolio.quickFacts.map((fact) => (
                      <div
                        key={fact.label}
                        className="rounded-[20px] border border-white/55 bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-black/15"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">{fact.label}</p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-text">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                </DemoShell>
              </Reveal>

              <Reveal delayMs={180} distance={22}>
                <DemoShell className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500">
                    <CalendarRange size={13} />
                    Toolkit
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-text">
                    Stack operativo de la demo
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Tecnologias y herramientas consistentes con el producto y con el tipo de portfolio que WINF promete.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {demoPortfolio.toolkit.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-surface/82 dark:text-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </DemoShell>
              </Reveal>
            </div>
          </section>

          <section id="writing" className="mt-14 sm:mt-16">
            <Reveal distance={22}>
              <SectionHeading
                icon={FileText}
                eyebrow="Writing"
                title="Posts que refuerzan criterio, no solo presencia."
                description="La escritura funciona como capa de confianza: explica procesos, decisiones y aprendizajes sin romper el flujo visual del portfolio."
              />
            </Reveal>

            <div className="grid gap-4 lg:grid-cols-3">
              {demoPortfolio.posts.map((post, index) => (
                <Reveal key={post.title} delayMs={80 + index * 90} distance={18}>
                  <DemoShell className="h-full p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-200">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted">{post.readTime}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-text">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-muted">{postDateFormatter.format(new Date(post.date))}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-accent-600 dark:text-accent-300">
                        Ver enfoque
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </DemoShell>
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal delayMs={120} distance={22}>
            <section className="mt-14 sm:mt-16">
              <DemoShell className="p-5 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-600 dark:border-white/10 dark:bg-surface/80 dark:text-accent-300">
                      <Sparkles size={12} />
                      Hardcoded demo
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-text sm:text-3xl">
                      Una demo publica real, creible y lista para vender la idea.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                      Todo el contenido de esta pagina es fake pero intencional: sirve para mostrar como puede verse un portfolio WINF completo antes de conectar datos reales.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#top"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/82 px-5 py-3 text-sm font-semibold text-text transition-all hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-surface/82"
                    >
                      Volver arriba
                      <ChevronRight size={16} />
                    </a>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.55)] transition-all hover:-translate-y-0.5 hover:opacity-95"
                    >
                      Explorar landing
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </DemoShell>
            </section>
          </Reveal>
        </main>
      </div>
    </div>
  )
}
