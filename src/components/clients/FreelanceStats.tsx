import { DollarSign, Clock, Briefcase } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ClientProject, Currency } from '@/types/clients'

interface FreelanceStatsProps {
  projects:        ClientProject[]
  defaultCurrency: Currency
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon:   React.FC<{ size?: number; className?: string }>
  label:  string
  value:  string
  sub?:   string
  accent?: boolean
}) {
  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border p-5',
        accent
          ? 'border-accent-200 bg-accent-50 dark:border-accent-900 dark:bg-accent-950/30'
          : 'border-border bg-surface',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg',
            accent ? 'bg-accent-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
          ].join(' ')}
        >
          <Icon size={15} />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>
    </div>
  )
}

export function FreelanceStats({ projects, defaultCurrency }: FreelanceStatsProps) {
  const now         = new Date()
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const active      = projects.filter((p) => p.status === 'active')
  const activeCount = active.length

  // Sumar pagos del mes actual usando paid_amount de proyectos completados este mes
  // y paid_amount acumulado de activos. Agrupamos por currency
  const billedThisMonthByCurrency = new Map<string, number>()
  const pendingByCurrency         = new Map<string, number>()

  for (const p of projects) {
    const cur = p.currency

    // Pendiente de cobro = budget - paid_amount para proyectos activos o pausados
    if ((p.status === 'active' || p.status === 'paused') && p.budget) {
      const pending = Math.max(0, p.budget - p.paid_amount)
      pendingByCurrency.set(cur, (pendingByCurrency.get(cur) ?? 0) + pending)
    }

    // Facturado este mes: proyectos con updated_at en el mes actual que tienen pagos
    if (p.updated_at >= monthStart && p.paid_amount > 0) {
      billedThisMonthByCurrency.set(cur, (billedThisMonthByCurrency.get(cur) ?? 0) + p.paid_amount)
    }
  }

  // Mostrar en la divisa dominante
  const billedThisMonth = billedThisMonthByCurrency.get(defaultCurrency) ?? 0
  const pending         = pendingByCurrency.get(defaultCurrency) ?? 0

  const otherCurrencies = [...new Set(
    [...billedThisMonthByCurrency.keys(), ...pendingByCurrency.keys()]
  )].filter((c) => c !== defaultCurrency)

  const subBilled = otherCurrencies.length > 0
    ? `+ otras divisas (${otherCurrencies.join(', ')})`
    : undefined

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Briefcase}
        label="Proyectos activos"
        value={String(activeCount)}
        sub={active.filter((p) => p.due_date && new Date(p.due_date) < now).length > 0
          ? `${active.filter((p) => p.due_date && new Date(p.due_date) < now).length} vencido(s)`
          : 'Sin vencimientos'}
        accent
      />
      <StatCard
        icon={DollarSign}
        label="Facturado este mes"
        value={formatCurrency(billedThisMonth, defaultCurrency)}
        sub={subBilled}
      />
      <StatCard
        icon={Clock}
        label="Pendiente de cobro"
        value={formatCurrency(pending, defaultCurrency)}
        sub={`${[...pendingByCurrency.keys()].filter(c => c !== defaultCurrency).length > 0 ? '+ otras divisas' : 'en proyectos activos'}`}
      />
    </div>
  )
}
