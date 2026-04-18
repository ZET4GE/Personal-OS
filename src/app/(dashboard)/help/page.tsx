import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock3, Crosshair, GitBranch, LifeBuoy, Settings } from 'lucide-react'

export const metadata: Metadata = { title: 'Ayuda' }

const GUIDE_CARDS = [
  {
    title: '1. Elegi una meta activa',
    description: 'La meta activa ordena dashboard, roadmap, acciones de hoy y progreso.',
    href: '/goals',
    icon: Crosshair,
  },
  {
    title: '2. Crea un camino',
    description: 'Usa roadmaps para dividir una meta en pasos entendibles y accionables.',
    href: '/roadmaps',
    icon: GitBranch,
  },
  {
    title: '3. Ejecuta hoy',
    description: 'Convierte pasos en proyectos, habitos, rutinas o sesiones de tiempo.',
    href: '/dashboard',
    icon: BookOpen,
  },
  {
    title: '4. Registra tiempo real',
    description: 'Asigna cada sesion a una meta o proyecto para medir avance concreto.',
    href: '/time',
    icon: Clock3,
  },
  {
    title: '5. Simplifica WINF',
    description: 'Activa solo los modulos que uses. El resto puede quedar oculto.',
    href: '/settings/preferences',
    icon: Settings,
  },
]

const FAQ = [
  {
    question: 'Que deberia hacer primero?',
    answer: 'Crear o elegir una meta activa. Todo lo demas deberia ayudar a cumplir esa meta.',
  },
  {
    question: 'Cuando uso Roadmaps?',
    answer: 'Cuando una meta es grande y necesitas convertirla en pasos o fases.',
  },
  {
    question: 'Cuando uso Proyectos?',
    answer: 'Cuando hay un entregable concreto: portfolio, app, cliente, curso practico o MVP.',
  },
  {
    question: 'Cuando uso Habitos y Rutinas?',
    answer: 'Habitos sirven para constancia diaria. Rutinas sirven para bloques repetibles de trabajo o vida.',
  },
  {
    question: 'Como bajo el ruido del dashboard?',
    answer: 'En Configuracion > Preferencias podes ocultar modulos y widgets que no uses.',
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-7 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
              <LifeBuoy size={15} />
              Centro de ayuda
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text">
              Usa WINF como una guia, no como una lista de modulos
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              El flujo recomendado es: meta activa, roadmap, accion de hoy y progreso real.
              Si algo no ayuda a cumplir tu meta, ocultalo.
            </p>
          </div>

          <Link
            href="/dashboard?tour=1"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Repetir tour
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text">Ruta recomendada</h3>
          <p className="text-sm text-muted">Segui estos pasos para no perderte.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GUIDE_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-bright hover:bg-surface-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600/15 text-accent-400">
                  <Icon size={18} />
                </span>
                <h4 className="mt-4 text-sm font-semibold text-text">{card.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-400">
                  Abrir
                  <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-lg font-semibold text-text">Preguntas rapidas</h3>
        <div className="mt-5 divide-y divide-border">
          {FAQ.map((item) => (
            <div key={item.question} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-text">{item.question}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
