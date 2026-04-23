export type DemoTone = 'sky' | 'cyan' | 'violet' | 'emerald'

export interface DemoMetric {
  value: string
  label: string
  detail: string
}

export interface DemoSignal {
  label: string
  value: string
  tone: DemoTone
}

export interface DemoActivity {
  label: string
  value: string
  detail: string
}

export interface DemoProject {
  title: string
  year: string
  stage: string
  impact: string
  summary: string
  tags: string[]
  wins: string[]
  tone: DemoTone
}

export interface DemoRoadmapPhase {
  phase: string
  window: string
  title: string
  summary: string
  progress: number
  deliverables: string[]
}

export interface DemoPost {
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
}

export interface DemoFact {
  label: string
  value: string
}

export interface DemoPortfolio {
  profile: {
    name: string
    handle: string
    role: string
    location: string
    availability: string
    headline: string
    bio: string
    focus: string[]
  }
  metrics: DemoMetric[]
  signals: DemoSignal[]
  weeklyFlow: DemoActivity[]
  projects: DemoProject[]
  roadmap: DemoRoadmapPhase[]
  posts: DemoPost[]
  quickFacts: DemoFact[]
  toolkit: string[]
}

export const demoPortfolio: DemoPortfolio = {
  profile: {
    name: 'Martina Sosa',
    handle: 'martinasosa',
    role: 'Product engineer para SaaS B2B, ops y AI workflows',
    location: 'Buenos Aires, Argentina',
    availability: 'Disponible para 1 sprint de discovery en junio',
    headline: 'Portfolios que muestran sistema, criterio y traccion real.',
    bio:
      'Construyo producto entre frontend, operaciones y narrativa tecnica. En WINF conecto entregables, roadmap, escritura y CV para que cada proyecto explique que resolvio y por que importa.',
    focus: ['Product systems', 'Next.js', 'Supabase', 'Growth ops'],
  },
  metrics: [
    {
      value: '14',
      label: 'lanzamientos',
      detail: 'entre betas privadas y productos en produccion',
    },
    {
      value: 'US$ 1.8M',
      label: 'pipeline trazado',
      detail: 'con automatizaciones sobre Atlas Ops',
    },
    {
      value: '93%',
      label: 'on-time delivery',
      detail: 'promedio de los ultimos 18 meses',
    },
  ],
  signals: [
    {
      label: 'Focus actual',
      value: 'Revenue ops + AI QA',
      tone: 'sky',
    },
    {
      label: 'Modo de trabajo',
      value: 'Design, build, instrument',
      tone: 'cyan',
    },
    {
      label: 'Escritura',
      value: '2 decision logs por sprint',
      tone: 'violet',
    },
    {
      label: 'Disponibilidad',
      value: '1 cupo para Q3',
      tone: 'emerald',
    },
  ],
  weeklyFlow: [
    {
      label: 'Client delivery',
      value: '24h',
      detail: 'Atlas Ops + Signal Desk',
    },
    {
      label: 'Product R&D',
      value: '10h',
      detail: 'AI copilots y templates de proceso',
    },
    {
      label: 'Writing',
      value: '2 posts',
      detail: 'case studies y notas operativas',
    },
    {
      label: 'Mentoring',
      value: '3 sesiones',
      detail: 'founders y PMs early-stage',
    },
  ],
  projects: [
    {
      title: 'Atlas Ops',
      year: '2026',
      stage: 'Live system',
      impact: '-38% onboarding time',
      summary:
        'Workspace para revenue teams con pipeline, SLA, playbooks y seguimiento de onboarding en un solo flujo.',
      tags: ['Next.js 16', 'Supabase', 'Postgres', 'LLM QA'],
      wins: [
        'Centralizo 6 vistas operativas en una sola UI.',
        'Conecto alerts, ownership y docs sin salir del flujo.',
        'Dejo medicion lista para demos, handoff y expansion.',
      ],
      tone: 'sky',
    },
    {
      title: 'Signal Desk',
      year: '2025',
      stage: 'Pilot with users',
      impact: '+27% reply rate',
      summary:
        'Sistema de outreach y priorizacion comercial para founders con scoring, snippets y loops de aprendizaje.',
      tags: ['React 19', 'Tailwind v4', 'OpenAI', 'PostHog'],
      wins: [
        'Reduce tiempo manual en research y personalizacion.',
        'Ordena senales de conversion por etapa y segmento.',
        'Permite iterar mensajes sin perder trazabilidad.',
      ],
      tone: 'cyan',
    },
    {
      title: 'Northstar Studio',
      year: '2024',
      stage: 'Case study',
      impact: 'NPS 57 en beta',
      summary:
        'Portal para conocimiento de producto y enablement con briefings, scorecards y vistas publicas para clientes.',
      tags: ['Design system', 'MDX', 'Figma', 'Analytics'],
      wins: [
        'Convierte documentacion dispersa en una narrativa clara.',
        'Combina contenido, benchmark y assets reutilizables.',
        'Sirve como base para venta consultiva y onboarding.',
      ],
      tone: 'violet',
    },
  ],
  roadmap: [
    {
      phase: '01',
      window: 'Abr - May',
      title: 'Foundation sprint',
      summary:
        'Cerrar posicionamiento, ordenar senales publicas y dejar el portfolio listo para discovery calls.',
      progress: 100,
      deliverables: ['Profile system', 'Case study template', 'Public metrics layer'],
    },
    {
      phase: '02',
      window: 'May - Jun',
      title: 'Growth engine',
      summary:
        'Automatizar inbound, convertir decision logs en contenido y medir conversion por origen.',
      progress: 72,
      deliverables: ['Lead capture', 'Writing cadence', 'Portfolio analytics'],
    },
    {
      phase: '03',
      window: 'Jul - Aug',
      title: 'Scale experiments',
      summary:
        'Abrir canal de partnerships, paquetizar oferta y probar nuevas demos de producto con feedback rapido.',
      progress: 28,
      deliverables: ['Partner page', 'Offer menu', 'Demo library'],
    },
  ],
  posts: [
    {
      category: 'Systems',
      title: 'Como diseno dashboards que sobreviven al handoff',
      excerpt:
        'Tres reglas para que producto, ops y liderazgo lean el mismo tablero sin friccion.',
      date: '2026-03-18',
      readTime: '6 min',
    },
    {
      category: 'Growth',
      title: 'Del brief a la demo: una secuencia que baja ruido y acelera decisiones',
      excerpt:
        'El framework que uso para pasar de discovery a shipping con menos reuniones y mejor contexto.',
      date: '2026-02-27',
      readTime: '5 min',
    },
    {
      category: 'AI workflows',
      title: 'Donde si y donde no meter copilots en una operacion chica',
      excerpt:
        'Casos concretos donde la IA ahorra tiempo de verdad y casos donde solo agrega complejidad.',
      date: '2026-01-11',
      readTime: '7 min',
    },
  ],
  quickFacts: [
    { label: 'Base', value: 'Producto + frontend + ops' },
    { label: 'Experiencia', value: '7 anos construyendo SaaS y tools internas' },
    { label: 'Idiomas', value: 'Espanol nativo, ingles profesional' },
    { label: 'Formato', value: 'Discovery, build sprint o advisory mensual' },
    { label: 'Sectores', value: 'Fintech, HR tech, revenue ops, education' },
    { label: 'Senal fuerte', value: 'Narrativa visual + tracking accionable' },
  ],
  toolkit: [
    'Next.js',
    'React 19',
    'Tailwind',
    'Supabase',
    'Postgres',
    'Figma',
    'OpenAI',
    'Linear',
  ],
}
