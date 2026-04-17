export const FINANCE_TRANSACTION_TYPES = ['income', 'expense'] as const
export type FinanceTransactionType = (typeof FINANCE_TRANSACTION_TYPES)[number]

export const FINANCE_TYPE_LABELS: Record<FinanceTransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
}

export const FINANCE_CURRENCIES = ['ARS', 'USD', 'EUR'] as const
export type FinanceCurrency = (typeof FINANCE_CURRENCIES)[number]

export const FINANCE_PAYMENT_METHODS = ['transfer', 'cash', 'card', 'crypto', 'paypal', 'other'] as const
export type FinancePaymentMethod = (typeof FINANCE_PAYMENT_METHODS)[number]

export const FINANCE_PAYMENT_METHOD_LABELS: Record<FinancePaymentMethod, string> = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  crypto: 'Crypto',
  paypal: 'PayPal',
  other: 'Otro',
}

export interface FinanceTransaction {
  id: string
  user_id: string
  type: FinanceTransactionType
  amount: number
  currency: FinanceCurrency
  category: string | null
  description: string | null
  occurred_at: string
  payment_method: FinancePaymentMethod | null
  source_type: string | null
  source_id: string | null
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface FinanceSummary {
  currency: FinanceCurrency
  total_income: number
  total_expense: number
  balance: number
  transaction_count: number
}

export type FinanceActionResult =
  | { error: string; transaction?: never }
  | { transaction: FinanceTransaction; error?: never }
  | { ok: true; error?: never }
