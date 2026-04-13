import { formatCurrency } from '@/lib/utils'
import type { Currency } from '@/types/clients'

interface PaymentProgressProps {
  paidAmount: number
  budget:     number | null
  currency:   Currency
}

export function PaymentProgress({ paidAmount, budget, currency }: PaymentProgressProps) {
  if (!budget || budget <= 0) {
    return (
      <p className="text-xs text-muted">
        Cobrado: {formatCurrency(paidAmount, currency)}
      </p>
    )
  }

  const pct      = Math.min(Math.round((paidAmount / budget) * 100), 100)
  const isFull   = pct >= 100
  const barColor = isFull ? 'bg-green-500' : pct > 50 ? 'bg-accent-600' : 'bg-amber-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted">
        <span>{formatCurrency(paidAmount, currency)} cobrado</span>
        <span className={isFull ? 'font-semibold text-green-600' : ''}>
          {pct}% de {formatCurrency(budget, currency)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
