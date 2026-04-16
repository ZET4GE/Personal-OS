import {
  Briefcase, FolderOpen, Wallet, FileText,
  Target, PenLine, BarChart3, StickyNote,
  Plug, Globe,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Job Tracker',
    description: 'Seguimiento completo de postulaciones: empresa, puesto, estado, entrevistas y respuestas.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  {
    icon: FolderOpen,
    title: 'Proyectos',
    description: 'Gestioná proyectos personales con stack tecnológico y hacelos públicos en tu portafolio.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
  },
  {
    icon: Wallet,
    title: 'Freelance',
    description: 'Clientes, presupuestos, pagos parciales y seguimiento de proyectos freelance.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
  {
    icon: FileText,
    title: 'CV Builder',
    description: 'CV profesional editable con export a PDF. Siempre actualizado y listo para enviar.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
  },
  {
    icon: Target,
    title: 'Hábitos',
    description: 'Tracking diario con rachas, frecuencia configurable y estadísticas de progreso.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
  },
  {
    icon: PenLine,
    title: 'Blog',
    description: 'Publicá artículos con Markdown. Tu blog aparece en tu portafolio público automáticamente.',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Métricas de visitas a tu perfil público. Sabé quién está viendo tu portafolio.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
  },
  {
    icon: StickyNote,
    title: 'Notas / Wiki',
    description: 'Wiki personal con Markdown, carpetas, tags, wiki-links y páginas públicas.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/15',
  },
  {
    icon: Plug,
    title: 'Integraciones',
    description: 'Conectá Google Calendar y GitHub para ver eventos y commits directo en el dashboard.',
    color: 'text-accent-500',
    bg: 'bg-accent-500/10 dark:bg-accent-500/15',
  },
  {
    icon: Globe,
    title: 'Multi-idioma',
    description: 'Interfaz disponible en Español e Inglés. Cambiá el idioma en cualquier momento.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
  },
] as const

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Todo incluido
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Una herramienta para{' '}
            <span className="bg-gradient-to-r from-accent-500 to-violet-500 bg-clip-text text-transparent">
              toda tu vida profesional
            </span>
          </h2>
          <p className="mt-4 text-muted">
            No más saltar entre apps. WINF reúne todo lo que necesitás
            para organizarte y mostrar tu trabajo en un solo lugar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FEATURES.slice(0, 8).map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
          {/* Last two centered on their row at xl */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2 xl:col-start-2 grid gap-4 sm:grid-cols-2">
            {FEATURES.slice(8).map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon, title, description, color, bg,
}: {
  icon: React.ElementType; title: string; description: string; color: string; bg: string
}) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)]">
      <div className={`mb-4 inline-flex rounded-lg p-2.5 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-text">{title}</h3>
      <p className="text-xs leading-relaxed text-muted">{description}</p>
    </div>
  )
}
