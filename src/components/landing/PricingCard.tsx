import Link from 'next/link'
import { Check, ArrowRight, Code2 } from 'lucide-react'

const FEATURES = [
  'Dashboard completo',
  'Job Tracker ilimitado',
  'Proyectos públicos y privados',
  'Gestión de clientes y freelance',
  'CV Builder con export PDF',
  'Hábitos y rutinas',
  'Blog con Markdown',
  'Notas / Wiki personal',
  'Perfil público (@username)',
  'Integraciones Google Calendar & GitHub',
  'Analytics de perfil',
  'Multi-idioma (ES / EN)',
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
            Gratis para siempre
          </h2>
          <p className="mt-4 text-muted">
            Personal OS es un proyecto open source. Todas las features están disponibles
            sin costo, sin trucos.
          </p>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-lg">
          <div className="relative rounded-2xl border border-accent-600/30 bg-surface p-8 shadow-[0_0_60px_-12px] shadow-accent-600/15">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center rounded-full bg-accent-600 px-3.5 py-1 text-xs font-semibold text-white shadow-lg shadow-accent-600/30">
                Plan único · Gratis
              </span>
            </div>

            {/* Price */}
            <div className="mt-2 text-center">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-text">$0</span>
                <span className="mb-1.5 text-sm text-muted">/ mes</span>
              </div>
              <p className="mt-1 text-xs text-muted">Para siempre. Sin límites.</p>
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
            <Link
              href="/signup"
              className="group mt-8 flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 transition-all hover:bg-accent-700 hover:shadow-xl active:scale-[0.98]"
            >
              Crear cuenta gratis
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-xs text-muted hover:text-text transition-colors"
            >
              <Code2 size={13} />
              Ver código fuente
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
