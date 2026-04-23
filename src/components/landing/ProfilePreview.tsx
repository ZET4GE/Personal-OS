import Link from 'next/link'
import { ArrowRight, BookOpen, Code2, ExternalLink, FileText, Globe, PenLine, Star } from 'lucide-react'
import { Reveal } from './Reveal'

function ProfileMockup() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface/75 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/10 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-3 flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[10px] text-muted">
          winf.com.ar/williams
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-violet-500 text-lg font-bold text-white">
            W
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-text">Williams Gutierrez</h3>
                <p className="mt-1 text-xs text-muted">@williams - Infrastructure & systems</p>
              </div>
              <span className="rounded-full border border-white/10 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                Publico
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-muted">
              Infraestructura, NOC, automatizacion y proyectos tecnicos conectados a metas reales.
            </p>
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
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted"
            >
              <item.icon size={11} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="flex gap-4 border-b border-white/10 pb-3">
          {[
            { label: 'Proyectos', icon: Code2 },
            { label: 'CV', icon: FileText },
            { label: 'Blog', icon: PenLine },
            { label: 'Wiki', icon: BookOpen },
          ].map((item, index) => (
            <span
              key={item.label}
              className={[
                'flex items-center gap-1 text-xs font-medium',
                index === 0 ? 'border-b-2 border-accent-500 pb-3 -mb-3 text-accent-400' : 'text-muted',
              ].join(' ')}
            >
              <item.icon size={11} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: 'AWS Lab', tech: 'Linux - Bash - Networking', stars: 48 },
            { name: 'Infra Wiki', tech: 'Markdown - Documentation', stars: 23 },
            { name: 'Client Stack', tech: 'Monitoring - OLT - DHCP', stars: 17 },
            { name: 'Roadmap DevOps', tech: 'Goals - Notes - Tasks', stars: 31 },
          ].map((project) => (
            <div key={project.name} className="rounded-xl border border-white/10 bg-black/10 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold leading-tight text-text">{project.name}</span>
                <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-muted">
                  <Star size={9} className="fill-yellow-400 text-yellow-400" />
                  {project.stars}
                </span>
              </div>
              <span className="mt-1 block text-[10px] text-muted">{project.tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfilePreview() {
  return (
    <section id="profiles" className="py-24 sm:py-32">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-accent-600/[0.04] to-transparent"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <Reveal>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-400">
                  Perfil publico
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
                  No mostras solo un portfolio.
                  <span className="block text-muted">Mostras contexto, progreso y criterio.</span>
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
                      <li className="flex items-center gap-3 rounded-2xl border border-white/8 bg-surface/40 px-4 py-3 text-sm text-text backdrop-blur-lg">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-500/10">
                          <item.icon size={14} className="text-accent-400" />
                        </span>
                        {item.text}
                      </li>
                    </Reveal>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-700 active:scale-[0.98]"
                  >
                    Crear mi perfil
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/williams"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-surface/55 px-5 py-2.5 text-sm font-semibold text-text backdrop-blur-lg transition-all hover:border-border-bright hover:bg-surface/70"
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
                  className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-r from-accent-600/15 via-cyan-500/10 to-violet-600/12 blur-2xl"
                />
                <div className="relative">
                  <ProfileMockup />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
