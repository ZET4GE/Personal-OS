'use client'

import { Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PAYMENT_METHOD_LABELS } from '@/types/clients'
import type { ProjectPayment } from '@/types/clients'

interface PaymentCardProps {
  payment:  ProjectPayment & { isOptimistic?: boolean }
  onDelete: (fd: FormData) => void
}

export function PaymentCard({ payment, onDelete }: PaymentCardProps) {
  const dateStr = new Date(payment.payment_date + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div
      className={[
        'group flex items-center gap-4 rounded-xl border bg-surface px-4 py-3',
        payment.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            + {formatCurrency(payment.amount, payment.currency)}
          </span>
          {payment.method && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex gap-3 text-xs text-muted">
          <span>{dateStr}</span>
          {payment.notes && <span className="truncate">{payment.notes}</span>}
        </div>
      </div>

      <form
        action={onDelete}
        onSubmit={(e) => { if (!confirm('¿Eliminar este pago?')) e.preventDefault() }}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <input type="hidden" name="id"         value={payment.id} />
        <input type="hidden" name="project_id" value={payment.project_id} />
        <button type="submit" disabled={payment.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40" aria-label="Eliminar pago">
          <Trash2 size={13} />
        </button>
      </form>
    </div>
  )
}
