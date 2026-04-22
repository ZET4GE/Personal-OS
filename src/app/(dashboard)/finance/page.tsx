import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FinanceClient } from '@/components/finance/FinanceClient'
import {
  getFinanceBudgetStatus,
  getFinanceCategories,
  getFinanceCategorySummary,
  getFinanceSummary,
  getFinanceTransactions,
} from '@/services/finance'
import { FINANCE_CURRENCIES, FINANCE_TRANSACTION_TYPES, FINANCE_TYPE_LABELS } from '@/types/finance'
import type { FinanceCurrency, FinanceTransactionType } from '@/types/finance'

export const metadata: Metadata = { title: 'Finanzas' }

interface PageProps {
  searchParams: Promise<{
    type?: string
    from?: string
    to?: string
    category?: string
    currency?: string
  }>
}

export default async function FinancePage({ searchParams }: PageProps) {
  const { type, from, to, category, currency } = await searchParams
  const typeFilter = FINANCE_TRANSACTION_TYPES.includes(type as FinanceTransactionType)
    ? (type as FinanceTransactionType)
    : undefined
  const currencyFilter = FINANCE_CURRENCIES.includes(currency as FinanceCurrency)
    ? (currency as FinanceCurrency)
    : undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

  const periodMonth = monthStart.slice(0, 7)
  const filters = {
    type: typeFilter,
    from: from || undefined,
    to: to || undefined,
    category: category || undefined,
    currency: currencyFilter,
  }

  const [
    transactionsResult,
    monthSummaryResult,
    totalSummaryResult,
    categorySummaryResult,
    categoriesResult,
    budgetStatusResult,
  ] = await Promise.all([
    getFinanceTransactions(supabase, user.id, filters),
    getFinanceSummary(supabase, user.id, monthStart, monthEnd),
    getFinanceSummary(supabase, user.id),
    getFinanceCategorySummary(supabase, user.id, from || monthStart, to || monthEnd),
    getFinanceCategories(supabase, user.id),
    getFinanceBudgetStatus(supabase, user.id, periodMonth),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Finanzas personales</h2>
        <p className="text-sm text-muted">
          Ingresos, gastos y balance real fuera de proyectos freelance.
        </p>
      </div>

      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por tipo">
        <FilterTab href="/finance" active={!typeFilter} label="Todos" />
        {FINANCE_TRANSACTION_TYPES.map((transactionType) => (
          <FilterTab
            key={transactionType}
            href={`/finance?type=${transactionType}`}
            active={typeFilter === transactionType}
            label={FINANCE_TYPE_LABELS[transactionType]}
          />
        ))}
      </nav>

      <FinanceClient
        transactions={transactionsResult.data ?? []}
        monthSummary={monthSummaryResult.data ?? []}
        totalSummary={totalSummaryResult.data ?? []}
        categorySummary={categorySummaryResult.data ?? []}
        categories={categoriesResult.data ?? []}
        budgets={budgetStatusResult.data ?? []}
        filters={{
          type: typeFilter ?? '',
          from: from ?? '',
          to: to ?? '',
          category: category ?? '',
          currency: currencyFilter ?? '',
          periodMonth,
        }}
      />
    </div>
  )
}

function FilterTab({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-surface-2 text-muted hover:bg-surface-hover hover:text-foreground',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}
