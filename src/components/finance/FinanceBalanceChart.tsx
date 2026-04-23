'use client'

import type { FinanceCurrency, FinanceTransaction } from '@/types/finance'
import { formatCurrency } from '@/lib/utils'

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface MonthBucket {
  label: string
  key: string
  income: number
  expense: number
  balance: number
}

function buildMonthBuckets(transactions: FinanceTransaction[], currency: FinanceCurrency): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    buckets.push({ label: MONTH_LABELS[month], key, income: 0, expense: 0, balance: 0 })
  }

  for (const tx of transactions) {
    if (tx.currency !== currency) continue
    const txKey = tx.occurred_at.slice(0, 7)
    const bucket = buckets.find((b) => b.key === txKey)
    if (!bucket) continue
    if (tx.type === 'income') bucket.income += Number(tx.amount)
    else bucket.expense += Number(tx.amount)
  }

  for (const bucket of buckets) {
    bucket.balance = bucket.income - bucket.expense
  }

  return buckets
}

const CHART_HEIGHT = 160
const BAR_WIDTH = 20
const BAR_GAP = 8
const GROUP_GAP = 28

function scaleValue(value: number, max: number): number {
  if (max === 0) return 0
  return Math.round((value / max) * CHART_HEIGHT)
}

interface FinanceBalanceChartProps {
  transactions: FinanceTransaction[]
  currency?: FinanceCurrency
}

export function FinanceBalanceChart({ transactions, currency = 'ARS' }: FinanceBalanceChartProps) {
  const buckets = buildMonthBuckets(transactions, currency)
  const allValues = buckets.flatMap((b) => [b.income, b.expense])
  const max = Math.max(...allValues, 1)

  const groupWidth = BAR_WIDTH * 2 + BAR_GAP
  const totalWidth = buckets.length * groupWidth + (buckets.length - 1) * GROUP_GAP
  const svgWidth = totalWidth + 40
  const svgHeight = CHART_HEIGHT + 48

  const groups = buckets.map((bucket, index) => {
    const x = 20 + index * (groupWidth + GROUP_GAP)
    const incomeH = scaleValue(bucket.income, max)
    const expenseH = scaleValue(bucket.expense, max)
    const incomeY = CHART_HEIGHT - incomeH
    const expenseY = CHART_HEIGHT - expenseH
    const balanceY = CHART_HEIGHT - scaleValue(Math.max(bucket.balance, 0), max)

    return { bucket, x, incomeH, expenseH, incomeY, expenseY, balanceY }
  })

  const balanceLine = groups
    .map(({ x, balanceY }) => `${x + groupWidth / 2},${balanceY}`)
    .join(' ')

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text">Balance mensual — últimos 6 meses</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" />
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
            Gastos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-accent-400" />
            Balance
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Gráfico de balance mensual"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = CHART_HEIGHT - Math.round(fraction * CHART_HEIGHT)
            return (
              <line
                key={fraction}
                x1={0}
                y1={y}
                x2={svgWidth}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
            )
          })}

          {groups.map(({ bucket, x, incomeH, expenseH, incomeY, expenseY }) => (
            <g key={bucket.key}>
              <rect
                x={x}
                y={incomeY}
                width={BAR_WIDTH}
                height={incomeH}
                rx={3}
                className="fill-emerald-400"
                opacity={0.85}
              />
              <rect
                x={x + BAR_WIDTH + BAR_GAP}
                y={expenseY}
                width={BAR_WIDTH}
                height={expenseH}
                rx={3}
                className="fill-red-400"
                opacity={0.85}
              />
              <text
                x={x + groupWidth / 2}
                y={CHART_HEIGHT + 18}
                textAnchor="middle"
                fontSize={11}
                className="fill-current text-muted"
                opacity={0.6}
              >
                {bucket.label}
              </text>
            </g>
          ))}

          {groups.length > 1 && (
            <polyline
              points={balanceLine}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-400"
              opacity={0.9}
            />
          )}

          {groups.map(({ bucket, x, balanceY }) => (
            <circle
              key={`dot-${bucket.key}`}
              cx={x + groupWidth / 2}
              cy={balanceY}
              r={3.5}
              className="fill-accent-400"
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 sm:grid-cols-6">
        {buckets.map((bucket) => (
          <div key={bucket.key} className="text-center">
            <p className="text-[11px] font-medium text-muted">{bucket.label}</p>
            <p className={['text-xs font-semibold', bucket.balance >= 0 ? 'text-emerald-400' : 'text-red-400'].join(' ')}>
              {formatCurrency(bucket.balance, currency)}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}
