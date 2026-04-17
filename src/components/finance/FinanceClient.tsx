'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import type { ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ReceiptText, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import {
  createFinanceTransactionAction,
  deleteFinanceTransactionAction,
  updateFinanceTransactionAction,
} from '@/app/(dashboard)/finance/actions'
import { FinanceForm, type FinanceFormHandle } from './FinanceForm'
import { FinanceTransactionCard } from './FinanceTransactionCard'
import { formatCurrency } from '@/lib/utils'
import type { FinanceSummary, FinanceTransaction } from '@/types/finance'

type OptimisticTransaction = FinanceTransaction & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add'; transaction: OptimisticTransaction }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<FinanceTransaction> }

function reducer(
  state: OptimisticTransaction[],
  op: OptimisticOp,
): OptimisticTransaction[] {
  switch (op.type) {
    case 'add':
      return [op.transaction, ...state]
    case 'delete':
      return state.filter((transaction) => transaction.id !== op.id)
    case 'update':
      return state.map((transaction) =>
        transaction.id === op.id ? { ...transaction, ...op.patch } : transaction,
      )
    default:
      return state
  }
}

interface FinanceClientProps {
  transactions: FinanceTransaction[]
  monthSummary: FinanceSummary[]
  totalSummary: FinanceSummary[]
}

export function FinanceClient({
  transactions,
  monthSummary,
  totalSummary,
}: FinanceClientProps) {
  const [optimisticTransactions, dispatch] = useOptimistic(transactions, reducer)
  const [, startTransition] = useTransition()
  const formRef = useRef<FinanceFormHandle>(null)
  const router = useRouter()

  function openCreate() {
    formRef.current?.open(null)
  }

  function openEdit(transaction: FinanceTransaction) {
    formRef.current?.open(transaction)
  }

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimistic: OptimisticTransaction = {
      id: `optimistic-${Date.now()}`,
      user_id: '',
      type: (formData.get('type') as FinanceTransaction['type']) ?? 'expense',
      amount: Number(formData.get('amount') ?? 0),
      currency: (formData.get('currency') as FinanceTransaction['currency']) ?? 'ARS',
      category: (formData.get('category') as string) || null,
      description: (formData.get('description') as string) || null,
      occurred_at: (formData.get('occurred_at') as string) || now.slice(0, 10),
      payment_method: (formData.get('payment_method') as FinanceTransaction['payment_method']) ?? null,
      source_type: null,
      source_id: null,
      is_recurring: formData.get('is_recurring') === 'on',
      created_at: now,
      updated_at: now,
      isOptimistic: true,
    }

    startTransition(async () => {
      dispatch({ type: 'add', transaction: optimistic })
      const result = await createFinanceTransactionAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Movimiento creado')
        router.refresh()
      }
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<FinanceTransaction> = {
      type: formData.get('type') as FinanceTransaction['type'],
      amount: Number(formData.get('amount') ?? 0),
      currency: formData.get('currency') as FinanceTransaction['currency'],
      category: (formData.get('category') as string) || null,
      description: (formData.get('description') as string) || null,
      occurred_at: String(formData.get('occurred_at') ?? ''),
      payment_method: (formData.get('payment_method') as FinanceTransaction['payment_method']) ?? null,
      is_recurring: formData.get('is_recurring') === 'on',
    }

    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateFinanceTransactionAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Movimiento actualizado')
        router.refresh()
      }
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')

    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteFinanceTransactionAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Movimiento eliminado')
        router.refresh()
      }
    })
  }

  return (
    <>
      <section className="grid gap-3 lg:grid-cols-3">
        <SummaryCard
          icon={TrendingUp}
          title="Ingresos del mes"
          summary={monthSummary}
          field="total_income"
          tone="income"
        />
        <SummaryCard
          icon={TrendingDown}
          title="Gastos del mes"
          summary={monthSummary}
          field="total_expense"
          tone="expense"
        />
        <SummaryCard
          icon={WalletCards}
          title="Balance total"
          summary={totalSummary}
          field="balance"
          tone="balance"
        />
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {optimisticTransactions.length} {optimisticTransactions.length === 1 ? 'movimiento' : 'movimientos'}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {optimisticTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
            <ReceiptText size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin movimientos todavia</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Registra ingresos y gastos personales para entender tu balance real.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {optimisticTransactions.map((transaction) => (
            <FinanceTransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <FinanceForm
        ref={formRef}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  summary,
  field,
  tone,
}: {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  summary: FinanceSummary[]
  field: keyof Pick<FinanceSummary, 'total_income' | 'total_expense' | 'balance'>
  tone: 'income' | 'expense' | 'balance'
}) {
  const color =
    tone === 'income'
      ? 'text-emerald-400'
      : tone === 'expense'
        ? 'text-red-400'
        : 'text-accent-400'

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{title}</p>
        <Icon size={16} className={color} />
      </div>
      <div className="mt-3 space-y-1">
        {summary.length === 0 ? (
          <p className="text-2xl font-semibold text-text">{formatCurrency(0, 'ARS')}</p>
        ) : (
          summary.map((item) => (
            <p key={`${title}-${item.currency}`} className={`text-2xl font-semibold ${color}`}>
              {formatCurrency(Number(item[field] ?? 0), item.currency)}
            </p>
          ))
        )}
      </div>
    </article>
  )
}
