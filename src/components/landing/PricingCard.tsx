import { Check, Lock, Sparkles, Zap } from 'lucide-react'
import { AuthCTAButton } from './AuthCTAButton'
import { Reveal } from './Reveal'

const PLANS = [
  {
    name: 'Free',
    badge: 'Base activa',
    price: '$0',
    suffix: 'para siempre',
    note: 'Para entrar, ordenar y empezar a avanzar sin friccion.',
    features: [
      'Meta activa y dashboard guiado',
      'Roadmaps basicos',
      'Timer y finanzas personales',
      'CV, blog y perfil publico',
      'Notas, proyectos y habitos',
    ],
    accent: 'from-accent-500/18 via-cyan-500/10 to-transparent',
    current: true,
  },
  {
    name: 'Pro',
    badge: 'Siguiente capa',
    price: 'Pro',
    suffix: 'proximamente',
    note: 'Exportes ATS, mas limites, automatizaciones y analitica personal.',
    features: [
      'CV ATS y exportes pro',
      'Limites ampliados',
      'Analytics de productividad',
      'Buscador y tags avanzados',
      'Plantillas y presets',
    ],
    accent: 'from-violet-500/16 via-fuchsia-500/8 to-transparent',
    current: false,
  },
  {
    name: 'Team',
    badge: 'Etapa final',
    price: 'Team',
    suffix: 'mas adelante',
    note: 'Espacios colaborativos, permisos y flujo compartido.',
    features: [
      'Roadmaps colaborativos',
      'Roles y permisos',
      'Clientes y proyectos compartidos',
      'Soporte prioritario',
      'Vista de equipo',
    ],
    accent: 'from-emerald-500/16 via-teal-500/8 to-transparent',
    current: false,
  },
] as const

export function PricingCard() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-64 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.14),transparent_62%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center" distance={26}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
            <Sparkles size={12} className="shrink-0" />
            Pricing
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl lg:text-5xl">
            Entra gratis.
            <span className="mt-2 block text-muted">Paga cuando necesites mas profundidad.</span>
          </h2>
          <p className="mt-5 text-base leading-7 text-muted">
            La base gratuita sirve de verdad. Los planes pagos no bloquean el producto:
            amplian alcance, exportacion y potencia para perfiles mas intensivos.
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} delayMs={index * 80} distance={18}>
              <div
                className={[
                  'relative h-full overflow-hidden rounded-[1.95rem] border p-6 shadow-[0_26px_72px_-46px_rgba(15,23,42,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 sm:p-7',
                  plan.current
                    ? 'border-accent-500/35 bg-white/64 dark:bg-surface/72'
                    : 'border-slate-200/75 bg-white/56 dark:border-white/10 dark:bg-surface/60',
                  plan.current
                    ? 'hover:shadow-[0_32px_84px_-50px_rgba(59,130,246,0.35)] dark:shadow-[var(--shadow-card-hover)]'
                    : 'hover:border-slate-300/80 hover:shadow-[0_30px_80px_-52px_rgba(15,23,42,0.24)] dark:shadow-[var(--shadow-card)] dark:hover:border-border-bright dark:hover:shadow-[var(--shadow-card-hover)]',
                ].join(' ')}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.accent}`} />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/55 to-transparent dark:from-white/5" />
                {plan.current ? (
                  <div className="absolute right-5 top-5 rounded-full border border-accent-500/20 bg-accent-500/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-500 dark:text-accent-300">
                    Recomendado
                  </div>
                ) : null}

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3 pr-20">
                    <div>
                      <h3 className="text-xl font-semibold text-text">{plan.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{plan.note}</p>
                    </div>
                    <span className="rounded-full border border-slate-200/80 bg-white/72 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-white/5 dark:text-muted">
                      {plan.badge}
                    </span>
                  </div>

                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-[-0.04em] text-text">{plan.price}</span>
                    <span className="mb-1 text-sm text-muted">{plan.suffix}</span>
                  </div>

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-text">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/15">
                          <Check size={11} className="text-emerald-500 dark:text-emerald-300" strokeWidth={2.5} />
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
                      className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/48 px-4 py-3 text-sm font-medium text-slate-500 backdrop-blur-lg dark:border-white/10 dark:bg-black/10 dark:text-muted"
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
          <div className="rounded-[1.5rem] border border-slate-200/75 bg-white/48 px-4 py-3 text-xs text-muted shadow-[0_18px_40px_-32px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/45 dark:shadow-none">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Sparkles size={12} className="text-accent-500 dark:text-accent-300" />
              Free util de verdad
              <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
              Pro para exportes, ATS y profundidad
              <span className="inline-flex h-1 w-1 rounded-full bg-border-bright" />
              Team queda para la etapa colaborativa
              <Zap size={12} className="text-amber-500 dark:text-amber-300" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
