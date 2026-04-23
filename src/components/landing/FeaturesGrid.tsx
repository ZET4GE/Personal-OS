import {
  BarChart3,
  Briefcase,
  FileText,
  FolderOpen,
  Globe,
  PenLine,
  Plug,
  Sparkles,
  StickyNote,
  Target,
  Wallet,
} from 'lucide-react'
import { Reveal } from './Reveal'

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Job Tracker',
    description: 'Seguimiento completo de postulaciones, entrevistas, respuestas y proximos pasos sin perder contexto.',
    color: 'text-blue-500 dark:text-blue-300',
    bg: 'from-blue-500/16 via-cyan-500/8 to-transparent',
    signal: 'Pipeline claro',
    tag: 'Core',
    size: 'lg',
  },
  {
    icon: FolderOpen,
    title: 'Proyectos',
    description: 'Documenta stack, demo, roadmap, tags y visibilidad publica o privada desde la misma base.',
    color: 'text-violet-500 dark:text-violet-300',
    bg: 'from-violet-500/16 via-fuchsia-500/8 to-transparent',
    signal: 'Portfolio vivo',
    tag: 'Build',
    size: 'md',
  },
  {
    icon: Wallet,
    title: 'Freelance + Finanzas',
    description: 'Clientes, cobros, presupuesto y balance personal en un flujo mas claro.',
    color: 'text-emerald-500 dark:text-emerald-300',
    bg: 'from-emerald-500/16 via-teal-500/8 to-transparent',
    signal: 'Caja bajo control',
    tag: 'Money',
    size: 'md',
  },
  {
    icon: FileText,
    title: 'CV Builder',
    description: 'CV visual, PDF y ATS en el mismo modulo. Editas una vez y exportas segun el contexto.',
    color: 'text-amber-500 dark:text-amber-300',
    bg: 'from-amber-500/16 via-orange-500/8 to-transparent',
    signal: 'Export listo',
    tag: 'Career',
    size: 'md',
  },
  {
    icon: Target,
    title: 'Habitos + Metas',
    description: 'El trabajo diario se conecta con el objetivo principal. No queda flotando como checklist aislado.',
    color: 'text-rose-500 dark:text-rose-300',
    bg: 'from-rose-500/16 via-pink-500/8 to-transparent',
    signal: 'Foco conectado',
    tag: 'Focus',
    size: 'md',
  },
  {
    icon: PenLine,
    title: 'Blog publico',
    description: 'Publica articulos, muestra criterio y fortalece tu perfil profesional desde WINF.',
    color: 'text-sky-500 dark:text-sky-300',
    bg: 'from-sky-500/16 via-blue-500/8 to-transparent',
    signal: 'Escribe y muestra',
    tag: 'Voice',
    size: 'sm',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Visitas, actividad y lectura del perfil publico para saber que interesa de tu trabajo.',
    color: 'text-orange-500 dark:text-orange-300',
    bg: 'from-orange-500/16 via-amber-500/8 to-transparent',
    signal: 'Feedback real',
    tag: 'Signals',
    size: 'sm',
  },
  {
    icon: StickyNote,
    title: 'Notas y wiki',
    description: 'Ideas, documentacion personal y contenido reutilizable sin salir del sistema.',
    color: 'text-yellow-500 dark:text-yellow-300',
    bg: 'from-yellow-500/16 via-lime-500/8 to-transparent',
    signal: 'Base comun',
    tag: 'Knowledge',
    size: 'sm',
  },
  {
    icon: Plug,
    title: 'Integraciones',
    description: 'GitHub y Calendar conectados al flujo de trabajo, no como adorno de dashboard.',
    color: 'text-accent-500 dark:text-accent-300',
    bg: 'from-accent-500/16 via-indigo-500/8 to-transparent',
    signal: 'Sistema abierto',
    tag: 'Sync',
    size: 'sm',
  },
  {
    icon: Globe,
    title: 'Perfil publico',
    description: 'Tu usuario, CV, proyectos, roadmaps y blog listos para compartir con una sola URL.',
    color: 'text-teal-500 dark:text-teal-300',
    bg: 'from-teal-500/16 via-cyan-500/8 to-transparent',
    signal: 'Una URL util',
    tag: 'Public',
    size: 'lg',
  },
] as const

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-56 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.16),transparent_60%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center sm:mb-16" distance={26}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
            <Sparkles size={12} className="shrink-0" />
            Sistema completo
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
            No suma modulos.
            <span className="mt-2 block text-muted">Construye un flujo de trabajo conectado.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            La diferencia no es tener muchas pantallas. Es que todo empuje en la misma direccion:
            meta, ejecucion diaria, tiempo invertido y visibilidad profesional.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-12">
          {FEATURES.map((feature, index) => (
            <Reveal
              key={feature.title}
              delayMs={index * 55}
              distance={18}
              className={
                feature.size === 'lg'
                  ? 'xl:col-span-5'
                  : feature.size === 'md'
                    ? 'xl:col-span-4'
                    : 'xl:col-span-3'
              }
            >
              <FeatureCard {...feature} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  bg,
  signal,
  tag,
  size,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  bg: string
  signal: string
  tag: string
  size: 'lg' | 'md' | 'sm'
}) {
  return (
    <div
      className={[
        'group relative h-full overflow-hidden rounded-[1.9rem] border border-slate-200/75 bg-white/58 p-5 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_28px_70px_-40px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-surface/65 dark:shadow-[var(--shadow-card)] dark:hover:border-border-bright dark:hover:shadow-[var(--shadow-card-hover)] sm:p-6',
        size === 'lg'
          ? 'min-h-[15.75rem] sm:min-h-[17rem]'
          : size === 'md'
            ? 'min-h-[14.5rem] sm:min-h-[15.5rem]'
            : 'min-h-[13.5rem] sm:min-h-[14.5rem]',
      ].join(' ')}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-90 dark:opacity-100`} />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/55 to-transparent dark:from-white/5" />
      <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-white/45 blur-3xl transition-transform duration-500 group-hover:scale-125 dark:bg-white/5" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/72 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-black/15 dark:shadow-none ${color}`}
          >
            <Icon size={20} />
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white/72 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-muted">
            {tag}
          </span>
        </div>

        <div className="mt-auto pt-10 sm:pt-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-muted">
            {signal}
          </p>
          <h3 className="mt-3 max-w-xs text-lg font-semibold tracking-[-0.02em] text-text">{title}</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </div>
  )
}
