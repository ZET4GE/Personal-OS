import Link from 'next/link'
import { ArrowRight, Globe, Code2, PenLine, BookOpen, FileText, Star } from 'lucide-react'

// Static mockup of a public profile page

function ProfileMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-3 flex-1 rounded bg-surface-3 px-3 py-0.5 text-[10px] text-muted">
          winf.com.ar/williams
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Profile header */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
            W
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text">Williams García</h3>
            <p className="text-xs text-muted">@williams · Full-Stack Developer</p>
            <p className="mt-1 text-xs text-muted line-clamp-2">
              Desarrollador full-stack apasionado por crear productos útiles.
              Actualmente buscando oportunidades remote.
            </p>
          </div>
        </div>

        {/* Public links */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Globe, label: 'winf.com.ar' },
            { icon: Code2, label: 'github/williams' },
          ].map((l) => (
            <span
              key={l.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted"
            >
              <l.icon size={11} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Sections nav */}
        <div className="flex gap-4 border-b border-border pb-3">
          {(
            [
              { label: 'Proyectos', icon: Code2    },
              { label: 'CV',        icon: FileText  },
              { label: 'Blog',      icon: PenLine   },
              { label: 'Wiki',      icon: BookOpen  },
            ] as const
          ).map(({ label, icon: Icon }, i) => (
            <span
              key={label}
              className={`flex items-center gap-1 text-xs font-medium ${i === 0 ? 'text-accent-600 border-b-2 border-accent-600 pb-3 -mb-3' : 'text-muted'}`}
            >
              <Icon size={11} />
              {label}
            </span>
          ))}
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: 'WINF', tech: 'Next.js · Supabase', stars: 48 },
            { name: 'CLI Tools', tech: 'Rust · Clap', stars: 23 },
            { name: 'Portfolio API', tech: 'Go · Fiber', stars: 17 },
            { name: 'UI Kit', tech: 'React · Tailwind', stars: 31 },
          ].map((p) => (
            <div key={p.name} className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-semibold text-text leading-tight">{p.name}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted shrink-0">
                  <Star size={9} className="text-yellow-400 fill-yellow-400" />
                  {p.stars}
                </span>
              </div>
              <span className="mt-1 block text-[10px] text-muted">{p.tech}</span>
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
      {/* Subtle background */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-accent-600/[0.03] to-transparent"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
                Portafolio público
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tu portafolio profesional{' '}
                <span className="bg-gradient-to-r from-accent-500 to-violet-500 bg-clip-text text-transparent">
                  en minutos
                </span>
              </h2>
              <p className="mt-4 text-muted">
                Cada cuenta tiene un perfil público en{' '}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                  winf.com.ar/@usuario
                </code>
                . Mostrá tus proyectos, publicá tu CV, escribí en tu blog y compartí
                tu wiki — todo listo para compartir con empleadores o clientes.
              </p>

              {/* Feature bullets */}
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Code2,    text: 'Proyectos con stack tecnológico y links' },
                  { icon: FileText, text: 'CV profesional con export a PDF' },
                  { icon: PenLine,  text: 'Blog de artículos en Markdown' },
                  { icon: BookOpen, text: 'Wiki pública con wiki-links y backlinks' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-text">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-600/10">
                      <item.icon size={12} className="text-accent-600" />
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 transition-all active:scale-[0.98]"
                >
                  Crear mi perfil
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/williams"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text hover:border-border-bright hover:bg-surface-2 transition-all"
                >
                  Ver perfil de ejemplo
                </Link>
              </div>
            </div>

            {/* Mockup */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent-600/10 to-violet-600/10 blur-2xl"
              />
              <div className="relative">
                <ProfileMockup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
