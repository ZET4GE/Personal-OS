import { Check, Lock, Sparkles, Zap } from 'lucide-react'
import { AuthCTAButton } from './AuthCTAButton'
import { Reveal } from './Reveal'

const PLANS = [
  {
    name: 'Free',
    badge: 'Base activa',
    price: '$0',
    note: 'Para entrar, ordenar y empezar a avanzar sin friccion.',
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
    badge: 'Siguiente capa',
    price: 'Pro',
    note: 'Exportes ATS, mas limites, automatizaciones y analitica personal.',
    features: [
      'CV ATS y exportes pro',
      'Limites ampliados',
      'Analytics de productividad',
      'Buscador y tags avanzados',
      'Plantillas y presets',
    ],
    current: false,
  },
  {
    name: 'Team',
    badge: 'Etapa final',
    price: 'Team',
    note: 'Espacios colaborativos, permisos y flujo compartido.',
    features: [
      'Roadmaps colaborativos',
      'Roles y permisos',
      'Clientes y proyectos compartidos',
      'Soporte prioritario',
      'Vista de equipo',
    ],
    current: false,
  },
] as const

export function PricingCard() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center" distance={26}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-400">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
            Entra gratis.
            <span className="block text-muted">Paga cuando necesites mas profundidad.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            La base gratuita sirve de verdad. Los planes pagos no bloquean el producto:
            amplian alcance, exportacion y potencia para perfiles mas intensivos.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delayMs={index * 80} distance={18}>
              <div
                className={[
                  'relative h-full overflow-hidden rounded-[1.9rem] border p-7 shadow-[var(--shadow-card)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
                  plan.current
                    ? 'border-accent-500/35 bg-gradient-to-b from-accent-500/12 via-surface/72 to-surface/72'
                    : 'border-white/10 bg-surface/60',
                ].join(' ')}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%)]" />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-text">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{plan.note}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-300">
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-[-0.04em] text-text">{plan.price}</span>
                    {plan.current ? <span className="mb-1 text-sm text-muted">para siempre</span> : null}
                  </div>

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-text">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                          <Check size={11} className="text-emerald-400" strokeWidth={2.5} />
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
                      className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm font-medium text-muted"
                    >
                      <Lock size={14} />
                      Pago no conectado aun
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={220} className="mt-6" distance={14}>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-surface/45 px-4 py-2 text-xs text-muted backdrop-blur-xl">
            <Sparkles size={12} className="text-accent-400" />
            Free util de verdad
            <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
            Pro para exportes, ATS y profundidad
            <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
            Team queda para la etapa colaborativa
            <Zap size={12} className="text-amber-400" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
