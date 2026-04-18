import { Check, Lock, Zap } from 'lucide-react'
import { AuthCTAButton } from './AuthCTAButton'

const FEATURES = [
  'Dashboard completo',
  'Job Tracker ilimitado',
  'Proyectos públicos y privados',
  'Gestión de clientes y freelance',
  'CV Builder con export PDF',
  'Hábitos, rutinas y metas',
  'Blog con Markdown',
  'Notas / Wiki personal',
  'Perfil público (@username)',
  'Integraciones Google Calendar & GitHub',
  'Analytics de perfil',
  'Multi-idioma (ES / EN)',
]

const PLANS = [
  {
    name: 'Free',
    badge: 'Para empezar',
    price: '$0',
    note: 'Sin tarjeta de credito.',
    features: [
      'Meta activa y dashboard guiado',
      'Roadmaps basicos',
      'Timer y finanzas personales',
      'CV, blog y perfil publico',
      'Notas, proyectos y habitos',
    ],
    current: true,
  },
  {
    name: 'Pro',
    badge: 'Proximamente',
    price: 'Pro',
    note: 'Mas limites, automatizaciones y analytics.',
    features: [
      'Limites ampliados',
      'Plantillas avanzadas',
      'Analytics de productividad',
      'Exportaciones pro',
      'Buscador y tags avanzados',
    ],
    current: false,
  },
  {
    name: 'Team',
    badge: 'Etapa final',
    price: 'Team',
    note: 'Colaboracion y gestion compartida.',
    features: [
      'Espacios de trabajo',
      'Roadmaps colaborativos',
      'Roles y permisos',
      'Clientes y proyectos compartidos',
      'Soporte prioritario',
    ],
    current: false,
  },
]

export function PricingCard() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comenzá gratis
          </h2>
          <p className="mt-4 text-muted">
            WINF mantiene una base gratuita y prepara planes pagos para limites,
            automatizaciones y trabajo colaborativo.
          </p>
          <p className="hidden">
            Todas las funcionalidades incluidas en el plan gratuito.
            Sin límites, sin trucos.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={[
                'relative rounded-2xl border bg-surface p-7 shadow-[var(--shadow-card)]',
                plan.current
                  ? 'border-accent-600/40 shadow-accent-600/10'
                  : 'border-border',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-text">{plan.name}</h3>
                <span className="rounded-full bg-accent-600/15 px-3 py-1 text-xs font-semibold text-accent-400">
                  {plan.badge}
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-text">{plan.price}</span>
                  {plan.current ? <span className="mb-1 text-sm text-muted">/ mes</span> : null}
                </div>
                <p className="mt-2 text-sm text-muted">{plan.note}</p>
              </div>

              <ul className="mt-7 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-text">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check size={11} className="text-emerald-500" strokeWidth={2.5} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <AuthCTAButton
                  label="Crear cuenta gratis"
                  mode="signup"
                  className="mt-8 w-full justify-center"
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-muted"
                >
                  <Lock size={14} />
                  Pago no conectado aun
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Zap size={12} className="text-amber-500" />
          Monetizacion preparada por etapas: primero limites visibles, despues checkout y webhooks.
        </div>

        {/* Card */}
        <div className="hidden">
          <div className="relative rounded-2xl border border-accent-600/30 bg-surface p-8 shadow-[0_0_60px_-12px] shadow-accent-600/15">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center rounded-full bg-accent-600 px-3.5 py-1 text-xs font-semibold text-white shadow-lg shadow-accent-600/30">
                Plan Gratuito
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 text-center">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-text">$0</span>
                <span className="mb-1.5 text-sm text-muted">/ mes</span>
              </div>
              <p className="mt-1 text-xs text-muted">Gratis para siempre. Sin tarjeta de crédito.</p>
            </div>

            {/* Features */}
            <ul className="mt-8 space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-text">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check size={11} className="text-emerald-500" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <AuthCTAButton
              label="Crear cuenta gratis"
              mode="signup"
              className="mt-8 w-full justify-center"
            />

            {/* Pro teaser */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Zap size={12} className="text-amber-500" />
              Próximamente: planes Pro con más funcionalidades
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
