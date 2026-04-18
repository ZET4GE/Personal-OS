'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import type { ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, PiggyBank, Plus, ReceiptText, SlidersHorizontal, Target, Trash2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import {
  createFinanceCategoryAction,
  createFinanceTransactionAction,
  deleteFinanceBudgetAction,
  deleteFinanceTransactionAction,
  updateFinanceTransactionAction,
  upsertFinanceBudgetAction,
} from '@/app/(dashboard)/finance/actions'
import { FinanceForm, type FinanceFormHandle } from './FinanceForm'
import { FinanceTransactionCard } from './FinanceTransactionCard'
import { formatCurrency } from '@/lib/utils'
import { FINANCE_CURRENCIES, FINANCE_TRANSACTION_TYPES, FINANCE_TYPE_LABELS } from '@/types/finance'
import type {
  FinanceBudgetStatus,
  FinanceCategory,
  FinanceCategorySummary,
  FinanceCurrency,
  FinanceSummary,
  FinanceTransaction,
  FinanceTransactionType,
} from '@/types/finance'

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
  categorySummary: FinanceCategorySummary[]
  categories: FinanceCategory[]
  budgets: FinanceBudgetStatus[]
  filters: {
    type: FinanceTransactionType | ''
    from: string
    to: string
    category: string
    currency: FinanceCurrency | ''
    periodMonth: string
  }
}

export function FinanceClient({
  transactions,
  monthSummary,
  totalSummary,
  categorySummary,
  categories,
  budgets,
  filters,
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

  function handleCreateCategory(formData: FormData) {
    startTransition(async () => {
      const result = await createFinanceCategoryAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Categoria creada')
        router.refresh()
      }
    })
  }

  function handleUpsertBudget(formData: FormData) {
    startTransition(async () => {
      const result = await upsertFinanceBudgetAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Presupuesto guardado')
        router.refresh()
      }
    })
  }

  function handleDeleteBudget(formData: FormData) {
    startTransition(async () => {
      const result = await deleteFinanceBudgetAction(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Presupuesto eliminado')
        router.refresh()
      }
    })
  }

  const categoryOptions = Array.from(new Set([
    ...categories.map((category) => category.name),
    ...optimisticTransactions
      .map((transaction) => transaction.category)
      .filter((category): category is string => Boolean(category)),
  ])).sort((a, b) => a.localeCompare(b))

  return (
    <>
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Finance Pro</p>
          <h2 className="mt-1 text-xl font-semibold text-text">Control de dinero personal</h2>
          <p className="mt-1 text-sm text-muted">
            Registra movimientos, controla categorias y revisa presupuestos del mes.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 transition-all hover:scale-[1.01] hover:opacity-95"
        >
          <Plus size={17} />
          Agregar movimiento
        </button>
      </section>

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

      <section className="grid gap-3 lg:grid-cols-4">
        <SavingsCard summary={monthSummary} />
        <FinanceFilters filters={filters} categoryOptions={categoryOptions} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <CategoryBreakdown items={categorySummary} />
        <BudgetPanel
          budgets={budgets}
          categories={categoryOptions}
          periodMonth={filters.periodMonth}
          onUpsert={handleUpsertBudget}
          onDelete={handleDeleteBudget}
        />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={15} className="text-accent-500" />
          <h3 className="text-sm font-semibold text-text">Categorias reutilizables</h3>
        </div>
        <form action={handleCreateCategory} className="grid gap-2 md:grid-cols-[1fr_160px_120px_auto]">
          <input name="name" type="text" placeholder="Ej: Alquiler, comida, sueldo" className={inputCls} />
          <select name="type" defaultValue="" className={inputCls}>
            <option value="">Ambas</option>
            {FINANCE_TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>{FINANCE_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <input name="color" type="text" placeholder="#2563eb" className={inputCls} />
          <button type="submit" className="rounded-lg bg-surface-2 px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover">
            Crear
          </button>
        </form>
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
        categories={categories}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
      />
    </>
  )
}

function SavingsCard({ summary }: { summary: FinanceSummary[] }) {
  const primary = summary[0]
  const income = Number(primary?.total_income ?? 0)
  const expense = Number(primary?.total_expense ?? 0)
  const balance = income - expense
  const rate = income > 0 ? Math.round((balance / income) * 100) : 0
  const currency = primary?.currency ?? 'ARS'

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Ahorro del mes</p>
        <PiggyBank size={16} className={rate >= 0 ? 'text-emerald-400' : 'text-red-400'} />
      </div>
      <p className={['mt-3 text-2xl font-semibold', rate >= 0 ? 'text-emerald-400' : 'text-red-400'].join(' ')}>
        {rate}%
      </p>
      <p className="mt-1 text-xs text-muted">
        Balance mensual: {formatCurrency(balance, currency)}
      </p>
    </article>
  )
}

function FinanceFilters({
  filters,
  categoryOptions,
}: {
  filters: FinanceClientProps['filters']
  categoryOptions: string[]
}) {
  return (
    <form action="/finance" method="get" className="rounded-xl border border-border bg-surface p-4 lg:col-span-3">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal size={15} className="text-accent-500" />
        <h3 className="text-sm font-semibold text-text">Filtros</h3>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        <select name="type" defaultValue={filters.type} className={inputCls}>
          <option value="">Todos</option>
          {FINANCE_TRANSACTION_TYPES.map((type) => (
            <option key={type} value={type}>{FINANCE_TYPE_LABELS[type]}</option>
          ))}
        </select>
        <input name="from" type="date" defaultValue={filters.from} className={inputCls} />
        <input name="to" type="date" defaultValue={filters.to} className={inputCls} />
        <select name="category" defaultValue={filters.category} className={inputCls}>
          <option value="">Todas las categorias</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select name="currency" defaultValue={filters.currency} className={inputCls}>
          <option value="">Todas las monedas</option>
          {FINANCE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <a href="/finance" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-text">
          Limpiar
        </a>
        <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white">
          Aplicar
        </button>
      </div>
    </form>
  )
}

function CategoryBreakdown({ items }: { items: FinanceCategorySummary[] }) {
  const expenses = items.filter((item) => item.type === 'expense')
  const max = Math.max(...expenses.map((item) => item.total), 1)

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={15} className="text-accent-500" />
        <h3 className="text-sm font-semibold text-text">Gastos por categoria</h3>
      </div>
      {expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted">Sin gastos para graficar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.slice(0, 8).map((item) => (
            <div key={`${item.category}-${item.currency}`}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-text">{item.category}</p>
                <span className="text-xs font-semibold text-text">{formatCurrency(item.total, item.currency)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.max(4, (item.total / max) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted">{item.transaction_count} movimientos</p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function BudgetPanel({
  budgets,
  categories,
  periodMonth,
  onUpsert,
  onDelete,
}: {
  budgets: FinanceBudgetStatus[]
  categories: string[]
  periodMonth: string
  onUpsert: (formData: FormData) => void
  onDelete: (formData: FormData) => void
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-4 flex items-center gap-2">
        <PiggyBank size={15} className="text-accent-500" />
        <h3 className="text-sm font-semibold text-text">Presupuestos del mes</h3>
      </div>

      <form action={onUpsert} className="mb-4 grid gap-2 md:grid-cols-[1fr_90px_120px_auto]">
        <input type="hidden" name="period_month" value={periodMonth} />
        <input name="category" list="budget-categories" placeholder="Categoria" className={inputCls} />
        <datalist id="budget-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <select name="currency" defaultValue="ARS" className={inputCls}>
          {FINANCE_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <input name="amount" type="number" min="1" step="0.01" placeholder="Monto" className={inputCls} />
        <button type="submit" className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover">
          Guardar
        </button>
      </form>

      {budgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted">Sin presupuestos definidos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const usage = Math.min(100, Math.round(budget.usage_rate * 100))
            const isOver = budget.remaining_amount < 0

            return (
              <div key={budget.id} className="rounded-xl bg-surface-2 p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{budget.category}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(budget.spent_amount, budget.currency)} / {formatCurrency(budget.budget_amount, budget.currency)}
                    </p>
                  </div>
                  <form action={onDelete}>
                    <input type="hidden" name="id" value={budget.id} />
                    <button type="submit" className="rounded p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={['h-full rounded-full', isOver ? 'bg-red-400' : 'bg-accent-500'].join(' ')}
                    style={{ width: `${usage}%` }}
                  />
                </div>
                <p className={['mt-1 text-[11px]', isOver ? 'text-red-300' : 'text-muted'].join(' ')}>
                  {isOver
                    ? `Excedido por ${formatCurrency(Math.abs(budget.remaining_amount), budget.currency)}`
                    : `Disponible ${formatCurrency(budget.remaining_amount, budget.currency)}`}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </article>
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

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors ' +
  'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 placeholder:text-muted'
