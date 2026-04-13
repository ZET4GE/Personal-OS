import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AnalyticsCardProps {
  label:   string
  value:   string | number
  sub?:    string
  icon:    LucideIcon
  change?: number   // porcentaje; undefined = sin comparativa
  accent?: boolean
}

export function AnalyticsCard({ label, value, sub, icon: Icon, change, accent }: AnalyticsCardProps) {
  const hasChange  = change !== undefined && !isNaN(change)
  const isPositive = hasChange && change! > 0
  const isNeutral  = hasChange && change! === 0
  const isNegative = hasChange && change! < 0

  const changeColor = isPositive
    ? 'text-green-600 dark:text-green-400'
    : isNegative
      ? 'text-red-500 dark:text-red-400'
      : 'text-muted'

  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-xl border p-5 transition-shadow hover:shadow-sm',
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
            accent
              ? 'bg-accent-600 text-white'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800',
          ].join(' ')}
        >
          <Icon size={15} />
        </span>
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </div>

      {hasChange && (
        <div className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
          <ChangeIcon size={13} />
          {isNeutral ? 'Sin cambio' : `${isPositive ? '+' : ''}${change}% vs semana anterior`}
        </div>
      )}
    </div>
  )
}
