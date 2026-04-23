import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Code2,
  ExternalLink,
  FileText,
  Globe,
  PenLine,
  Star,
} from 'lucide-react'
import { Reveal } from './Reveal'

function ProfileMockup() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/75 bg-white/68 shadow-[0_30px_90px_-44px_rgba(15,23,42,0.26)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/75 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
      <div className="flex items-center gap-1.5 border-b border-slate-200/75 bg-white/72 px-3 py-2.5 dark:border-white/10 dark:bg-black/10">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-3 flex-1 rounded-full border border-slate-200/80 bg-white/78 px-3 py-0.5 text-[10px] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-muted">
          winf.com.ar/williams
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 via-cyan-500 to-violet-500 text-lg font-bold text-white shadow-[0_18px_38px_-20px_rgba(59,130,246,0.5)] sm:h-20 sm:w-20">
            W
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-text sm:text-lg">Williams Gutierrez</h3>
                <p className="mt-1 text-xs text-muted">@williams - Infrastructure & systems</p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-emerald-500/20 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-300">
                Publico
              </span>
            </div>

            <p className="mt-3 max-w-xl text-xs leading-6 text-muted sm:text-sm">
              Infraestructura, NOC, automatizacion y proyectos tecnicos conectados a metas reales.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['12', 'Proyectos'],
                ['08', 'Roadmaps'],
                ['24', 'Posts'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200/75 bg-white/62 px-3 py-2 text-center dark:border-white/10 dark:bg-black/10"
                >
                  <div className="text-sm font-semibold text-text">{value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { icon: Globe, label: 'winf.com.ar/williams' },
            { icon: ExternalLink, label: 'LinkedIn' },
            { icon: Code2, label: 'github/williams' },
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/68 px-3 py-1.5 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-muted"
            >
              <item.icon size={11} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200/75 pb-3 dark:border-white/10">
          {[
            { label: 'Proyectos', icon: Code2 },
            { label: 'CV', icon: FileText },
            { label: 'Blog', icon: PenLine },
            { label: 'Wiki', icon: BookOpen },
          ].map((item, index) => (
            <span
              key={item.label}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                index === 0
                  ? 'bg-accent-500/12 text-accent-500 dark:text-accent-300'
                  : 'bg-slate-100/80 text-slate-500 dark:bg-white/5 dark:text-muted',
              ].join(' ')}
            >
              <item.icon size={11} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {[
            { name: 'AWS Lab', tech: 'Linux - Bash - Networking', stars: 48 },
            { name: 'Infra Wiki', tech: 'Markdown - Documentation', stars: 23 },
            { name: 'Client Stack', tech: 'Monitoring - OLT - DHCP', stars: 17 },
            { name: 'Roadmap DevOps', tech: 'Goals - Notes - Tasks', stars: 31 },
          ].map((project) => (
            <div
              key={project.name}
              className="rounded-[1.15rem] border border-slate-200/80 bg-white/62 p-3 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-black/10 dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold leading-tight text-text">{project.name}</span>
                <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted">
                  <Star size={9} className="fill-yellow-400 text-yellow-400" />
                  {project.stars}
                </span>
              </div>
              <span className="mt-1.5 block text-[10px] leading-5 text-muted">{project.tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfilePreview() {
  return (
    <section id="profiles" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-12 -z-10 h-64 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.14),transparent_62%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-14">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/68 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
                Perfil publico
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
                No mostras solo un portfolio.
                <span className="mt-2 block text-muted">Mostras contexto, progreso y criterio.</span>
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Cada cuenta puede exponer proyectos, CV, blog, roadmaps y wiki en una sola URL.
                El resultado se siente mas cercano a un sistema profesional vivo que a una pagina estatica.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  { icon: Code2, text: 'Proyectos con stack, links y visibilidad' },
                  { icon: FileText, text: 'CV profesional con export PDF y ATS' },
                  { icon: PenLine, text: 'Blog tecnico dentro del mismo perfil' },
                  { icon: BookOpen, text: 'Wiki publica con notas conectadas' },
                ].map((item, index) => (
                  <Reveal key={item.text} delayMs={80 + index * 60} distance={12}>
                    <li className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200/75 bg-white/56 px-4 py-3 text-sm text-text shadow-[0_14px_32px_-26px_rgba(15,23,42,0.16)] backdrop-blur-lg dark:border-white/10 dark:bg-surface/45 dark:shadow-none">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/72 dark:border-white/10 dark:bg-black/15">
                        <item.icon size={14} className="text-accent-500 dark:text-accent-300" />
                      </span>
                      {item.text}
                    </li>
                  </Reveal>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 via-cyan-500 to-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-20px_rgba(59,130,246,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-22px_rgba(59,130,246,0.52)] active:scale-[0.98]"
                >
                  Crear mi perfil
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/62 px-5 py-3 text-sm font-semibold text-text shadow-[0_16px_30px_-24px_rgba(15,23,42,0.16)] backdrop-blur-lg transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_38px_-24px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-surface/55 dark:shadow-none dark:hover:border-border-bright dark:hover:bg-surface/70"
                >
                  Ver ejemplo
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={120} distance={30}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-r from-accent-600/14 via-cyan-500/10 to-violet-600/12 blur-2xl dark:from-accent-600/20 dark:via-cyan-500/10 dark:to-violet-600/16"
              />
              <div className="relative">
                <ProfileMockup />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
