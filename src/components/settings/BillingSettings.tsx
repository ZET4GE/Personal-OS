import { Check, Lock, Zap } from 'lucide-react'
import {
  BILLING_PLAN_LABELS,
  BILLING_RESOURCE_LABELS,
  BILLING_STATUS_LABELS,
  type BillingPlan,
  type BillingStatus,
  type BillingUsageLimit,
} from '@/types/billing'

interface BillingSettingsProps {
  status: BillingStatus
  usage: BillingUsageLimit[]
}

const PLAN_FEATURES: Record<BillingPlan, string[]> = {
  free: [
    'Meta activa y dashboard guiado',
    'Roadmaps basicos',
    'CV y perfil publico',
    'Timer y finanzas personales',
  ],
  pro: [
    'Limites ampliados',
    'Analytics avanzados',
    'Exportaciones y plantillas pro',
    'Automatizaciones de productividad',
  ],
  team: [
    'Espacios compartidos',
    'Roadmaps colaborativos',
    'Roles y permisos',
    'Soporte prioritario',
  ],
}

const PLAN_PRICES: Record<BillingPlan, string> = {
  free: '$0',
  pro: 'Proximamente',
  team: 'Proximamente',
}

function usagePercent(item: BillingUsageLimit) {
  if (!item.limit_count) return 0
  return Math.min(100, Math.round((item.used_count / item.limit_count) * 100))
}

function usageLabel(item: BillingUsageLimit) {
  if (!item.limit_count) return `${item.used_count} usados`
  return `${item.used_count} / ${item.limit_count}`
}

export function BillingSettings({ status, usage }: BillingSettingsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
              Plan actual
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-text">
              {BILLING_PLAN_LABELS[status.plan]}
            </h3>
            <p className="mt-1 text-sm text-muted">
              Estado: {BILLING_STATUS_LABELS[status.status]}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted">
            {status.current_period_end
              ? `Renueva: ${new Date(status.current_period_end).toLocaleDateString('es-AR')}`
              : 'Sin ciclo de pago activo'}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-text">Uso actual</h3>
          <p className="mt-1 text-sm text-muted">
            Base preparada para aplicar limites sin romper el uso actual.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {usage.map((item) => {
            const percent = usagePercent(item)
            return (
              <div key={item.resource} className="rounded-lg border border-border bg-surface-elevated p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text">
                    {BILLING_RESOURCE_LABELS[item.resource] ?? item.resource}
                  </p>
                  <span className="text-xs text-muted">{usageLabel(item)}</span>
                </div>

                {item.limit_count ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-emerald-400">Sin limite</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(['free', 'pro', 'team'] as BillingPlan[]).map((plan) => {
          const isCurrent = status.plan === plan
          const isLocked = plan !== 'free'

          return (
            <article
              key={plan}
              className={[
                'rounded-xl border bg-surface p-5 shadow-[var(--shadow-card)]',
                isCurrent ? 'border-accent-500/60' : 'border-border',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-text">{BILLING_PLAN_LABELS[plan]}</h3>
                {isCurrent ? (
                  <span className="rounded-full bg-accent-500/15 px-2 py-1 text-xs font-medium text-accent-400">
                    Actual
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-2xl font-semibold text-text">{PLAN_PRICES[plan]}</p>

              <ul className="mt-5 space-y-2.5">
                {PLAN_FEATURES[plan].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className={[
                  'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                  isCurrent
                    ? 'bg-surface-elevated text-muted'
                    : 'bg-accent-600/20 text-accent-300',
                ].join(' ')}
              >
                {isLocked ? <Lock size={15} /> : <Zap size={15} />}
                {isCurrent ? 'Plan activo' : 'Pago no conectado aun'}
              </button>
            </article>
          )
        })}
      </section>
    </div>
  )
}
