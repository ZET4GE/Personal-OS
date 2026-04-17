'use client'

import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from 'lucide-react'
import { TagSelector } from '@/components/tags/TagSelector'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FINANCE_PAYMENT_METHOD_LABELS, FINANCE_TYPE_LABELS } from '@/types/finance'
import type { FinanceTransaction } from '@/types/finance'

interface FinanceTransactionCardProps {
  transaction: FinanceTransaction & { isOptimistic?: boolean }
  onEdit: (transaction: FinanceTransaction) => void
  onDelete: (formData: FormData) => void
}

export function FinanceTransactionCard({
  transaction,
  onEdit,
  onDelete,
}: FinanceTransactionCardProps) {
  const isIncome = transaction.type === 'income'
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle

  return (
    <article
      className={[
        'group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-bright',
        transaction.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
            ].join(' ')}
          >
            <Icon size={18} />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-text">
                {transaction.category || FINANCE_TYPE_LABELS[transaction.type]}
              </p>
              {transaction.is_recurring && (
                <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[11px] font-medium text-accent-400">
                  Recurrente
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              {formatDate(transaction.occurred_at)}
              {transaction.payment_method ? ` - ${FINANCE_PAYMENT_METHOD_LABELS[transaction.payment_method]}` : ''}
            </p>
            {transaction.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted">{transaction.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-start gap-2">
          <div className="text-right">
            <p className={isIncome ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
              {isIncome ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency)}
            </p>
            <TagSelector entityId={transaction.id} entityType="finance" compact />
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              disabled={transaction.isOptimistic}
              className="rounded p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            <form
              action={onDelete}
              onSubmit={(event) => {
                if (!confirm('Eliminar este movimiento?')) event.preventDefault()
              }}
            >
              <input type="hidden" name="id" value={transaction.id} />
              <button
                type="submit"
                disabled={transaction.isOptimistic}
                className="rounded p-1.5 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  )
}
