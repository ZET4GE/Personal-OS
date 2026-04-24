'use client'

import { useState, useMemo } from 'react'
import type { FinanceCurrency, FinanceTransaction } from '@/types/finance'
import { formatCurrency } from '@/lib/utils'

type Period = 'year' | 'month' | 'week'

const PERIOD_LABELS: Record<Period, string> = {
  year: '12 meses',
  month: 'Este mes',
  week: 'Esta semana',
}

interface Bucket {
  label: string
  sublabel?: string
  income: number
  expense: number
  balance: number
}

function getWeekBuckets(transactions: FinanceTransaction[], currency: FinanceCurrency): Bucket[] {
  const now = new Date()
  const buckets: Bucket[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const short = d.toLocaleDateString('es-AR', { weekday: 'short' })
    buckets.push({ label: short.charAt(0).toUpperCase() + short.slice(1, 3), sublabel: String(d.getDate()), income: 0, expense: 0, balance: 0 })
    for (const tx of transactions) {
      if (tx.currency !== currency || tx.occurred_at.slice(0, 10) !== key) continue
      if (tx.type === 'income') buckets[buckets.length - 1].income += Number(tx.amount)
      else buckets[buckets.length - 1].expense += Number(tx.amount)
    }
  }
  for (const b of buckets) b.balance = b.income - b.expense
  return buckets
}

function getMonthBuckets(transactions: FinanceTransaction[], currency: FinanceCurrency): Bucket[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const buckets: Bucket[] = []

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const bucket: Bucket = { label: String(d), income: 0, expense: 0, balance: 0 }
    for (const tx of transactions) {
      if (tx.currency !== currency || tx.occurred_at.slice(0, 10) !== key) continue
      if (tx.type === 'income') bucket.income += Number(tx.amount)
      else bucket.expense += Number(tx.amount)
    }
    bucket.balance = bucket.income - bucket.expense
    buckets.push(bucket)
  }
  return buckets
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function getYearBuckets(transactions: FinanceTransaction[], currency: FinanceCurrency): Bucket[] {
  const now = new Date()
  const buckets: Bucket[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const bucket: Bucket = {
      label: MONTH_NAMES[d.getMonth()],
      sublabel: d.getFullYear() !== now.getFullYear() ? String(d.getFullYear()).slice(2) : undefined,
      income: 0,
      expense: 0,
      balance: 0,
    }
    for (const tx of transactions) {
      if (tx.currency !== currency || tx.occurred_at.slice(0, 7) !== monthKey) continue
      if (tx.type === 'income') bucket.income += Number(tx.amount)
      else bucket.expense += Number(tx.amount)
    }
    bucket.balance = bucket.income - bucket.expense
    buckets.push(bucket)
  }
  return buckets
}

const CHART_H = 180
const PAD_LEFT = 8
const PAD_RIGHT = 8
const LABEL_H = 36

interface FinanceBalanceChartProps {
  transactions: FinanceTransaction[]
  currency?: FinanceCurrency
}

export function FinanceBalanceChart({ transactions, currency = 'ARS' }: FinanceBalanceChartProps) {
  const [period, setPeriod] = useState<Period>('year')

  const buckets = useMemo(() => {
    if (period === 'week') return getWeekBuckets(transactions, currency)
    if (period === 'month') return getMonthBuckets(transactions, currency)
    return getYearBuckets(transactions, currency)
  }, [transactions, currency, period])

  const hasData = buckets.some((b) => b.income > 0 || b.expense > 0)
  const maxVal = Math.max(...buckets.flatMap((b) => [b.income, b.expense]), 1)
  const n = buckets.length

  const svgW = 600
  const totalW = svgW - PAD_LEFT - PAD_RIGHT
  const groupW = totalW / n
  const barW = Math.max(Math.min(groupW * 0.35, 18), 4)
  const gap = Math.max(groupW * 0.06, 2)

  const groups = buckets.map((bucket, i) => {
    const cx = PAD_LEFT + groupW * i + groupW / 2
    const incomeH = (bucket.income / maxVal) * CHART_H
    const expenseH = (bucket.expense / maxVal) * CHART_H
    const balanceH = (Math.max(bucket.balance, 0) / maxVal) * CHART_H
    return {
      bucket,
      cx,
      incomeX: cx - barW - gap / 2,
      expenseX: cx + gap / 2,
      incomeH,
      expenseH,
      balanceY: CHART_H - balanceH,
    }
  })

  const balanceLine = groups.map(({ cx, balanceY }) => `${cx},${balanceY}`).join(' ')

  const svgH = CHART_H + LABEL_H
  const showEvery = period === 'month' ? 5 : 1

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-text">Balance</h3>
          <div className="flex rounded-lg border border-border bg-surface-elevated p-0.5">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  period === p ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400 opacity-85" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-400 opacity-85" />
            Gastos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-blue-400" />
            Balance
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-muted">Sin movimientos en este período</p>
        </div>
      ) : (
        <svg
          width="100%"
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          aria-label="Gráfico de balance"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = CHART_H - f * CHART_H
            return (
              <line key={f} x1={0} y1={y} x2={svgW} y2={y}
                stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
            )
          })}

          {groups.map(({ bucket, cx, incomeX, expenseX, incomeH, expenseH }, i) => (
            <g key={i}>
              {bucket.income > 0 && (
                <rect x={incomeX} y={CHART_H - incomeH} width={barW} height={incomeH}
                  rx={2} fill="#34d399" opacity={0.85} />
              )}
              {bucket.expense > 0 && (
                <rect x={expenseX} y={CHART_H - expenseH} width={barW} height={expenseH}
                  rx={2} fill="#f87171" opacity={0.85} />
              )}
              {(i % showEvery === 0) && (
                <text x={cx} y={CHART_H + 16} textAnchor="middle" fontSize={10}
                  fill="currentColor" opacity={0.5}>
                  {bucket.label}
                </text>
              )}
              {bucket.sublabel && (i % showEvery === 0) && (
                <text x={cx} y={CHART_H + 30} textAnchor="middle" fontSize={9}
                  fill="currentColor" opacity={0.35}>
                  {bucket.sublabel}
                </text>
              )}
            </g>
          ))}

          {groups.length > 1 && (
            <>
              <polyline points={balanceLine} fill="none"
                stroke="#60a5fa" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
              {groups.map(({ cx, balanceY, bucket }, i) => (
                bucket.income > 0 || bucket.expense > 0 ? (
                  <circle key={i} cx={cx} cy={balanceY} r={2.5} fill="#60a5fa" opacity={0.9} />
                ) : null
              ))}
            </>
          )}
        </svg>
      )}

      <div className="mt-2 flex justify-between border-t border-border pt-2">
        {['income', 'expense', 'balance'].map((key) => {
          const total = buckets.reduce((acc, b) => acc + (key === 'income' ? b.income : key === 'expense' ? b.expense : b.balance), 0)
          const color = key === 'income' ? 'text-emerald-400' : key === 'expense' ? 'text-red-400' : total >= 0 ? 'text-blue-400' : 'text-red-400'
          const label = key === 'income' ? 'Ingresos' : key === 'expense' ? 'Gastos' : 'Balance'
          return (
            <div key={key} className="text-center">
              <p className="text-[10px] text-muted">{label}</p>
              <p className={`text-xs font-semibold ${color}`}>{formatCurrency(total, currency)}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
