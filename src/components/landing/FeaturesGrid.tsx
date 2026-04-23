import {
  BarChart3,
  Briefcase,
  FileText,
  FolderOpen,
  Globe,
  PenLine,
  Plug,
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
    color: 'text-blue-400',
    bg: 'from-blue-500/18 to-cyan-500/8',
    size: 'lg',
  },
  {
    icon: FolderOpen,
    title: 'Proyectos',
    description: 'Documenta stack, demo, roadmap, tags y visibilidad publica o privada desde la misma base.',
    color: 'text-violet-400',
    bg: 'from-violet-500/16 to-fuchsia-500/8',
    size: 'md',
  },
  {
    icon: Wallet,
    title: 'Freelance + Finanzas',
    description: 'Clientes, cobros, presupuesto y balance personal en un flujo mas claro.',
    color: 'text-emerald-400',
    bg: 'from-emerald-500/16 to-teal-500/8',
    size: 'md',
  },
  {
    icon: FileText,
    title: 'CV Builder',
    description: 'CV visual, PDF y ATS en el mismo modulo. Editas una vez y exportas segun el contexto.',
    color: 'text-amber-400',
    bg: 'from-amber-500/18 to-orange-500/8',
    size: 'md',
  },
  {
    icon: Target,
    title: 'Habitos + Metas',
    description: 'El trabajo diario se conecta con el objetivo principal. No queda flotando como checklist aislado.',
    color: 'text-rose-400',
    bg: 'from-rose-500/18 to-pink-500/8',
    size: 'md',
  },
  {
    icon: PenLine,
    title: 'Blog publico',
    description: 'Publica articulos, muestra criterio y fortalece tu perfil profesional desde WINF.',
    color: 'text-sky-400',
    bg: 'from-sky-500/16 to-blue-500/8',
    size: 'sm',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Visitas, actividad y lectura del perfil publico para saber que interesa de tu trabajo.',
    color: 'text-orange-400',
    bg: 'from-orange-500/16 to-amber-500/8',
    size: 'sm',
  },
  {
    icon: StickyNote,
    title: 'Notas y wiki',
    description: 'Ideas, documentacion personal y contenido reutilizable sin salir del sistema.',
    color: 'text-yellow-400',
    bg: 'from-yellow-500/16 to-lime-500/8',
    size: 'sm',
  },
  {
    icon: Plug,
    title: 'Integraciones',
    description: 'GitHub y Calendar conectados al flujo de trabajo, no como adorno de dashboard.',
    color: 'text-accent-400',
    bg: 'from-accent-500/18 to-indigo-500/8',
    size: 'sm',
  },
  {
    icon: Globe,
    title: 'Perfil publico',
    description: 'Tu usuario, CV, proyectos, roadmaps y blog listos para compartir con una sola URL.',
    color: 'text-teal-400',
    bg: 'from-teal-500/16 to-cyan-500/8',
    size: 'lg',
  },
] as const

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center" distance={26}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-400">
            Sistema completo
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
            No suma modulos.
            <span className="block text-muted">Construye un flujo de trabajo conectado.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            La diferencia no es tener muchas pantallas. Es que todo empuje en la misma direccion:
            meta, ejecucion diaria, tiempo invertido y visibilidad profesional.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          {FEATURES.map((feature, index) => (
            <Reveal
              key={feature.title}
              delayMs={index * 55}
              distance={18}
              className={[
                feature.size === 'lg'
                  ? 'xl:col-span-5'
                  : feature.size === 'md'
                    ? 'xl:col-span-4'
                    : 'xl:col-span-3',
              ].join(' ')}
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
  size,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  bg: string
  size: 'lg' | 'md' | 'sm'
}) {
  return (
    <div
      className={[
        'group relative h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface/65 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)]',
        size === 'lg' ? 'min-h-[17rem]' : size === 'md' ? 'min-h-[15rem]' : 'min-h-[13.5rem]',
      ].join(' ')}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-80`} />
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative flex h-full flex-col">
        <div className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/15 ${color}`}>
          <Icon size={20} />
        </div>

        <div className="mt-auto">
          <h3 className="max-w-xs text-lg font-semibold tracking-[-0.02em] text-text">{title}</h3>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </div>
  )
}
