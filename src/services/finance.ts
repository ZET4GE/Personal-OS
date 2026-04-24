import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  FinanceBudget,
  FinanceBudgetStatus,
  FinanceCategory,
  FinanceCategorySummary,
  FinanceCurrency,
  FinanceSummary,
  FinanceTransaction,
  FinanceTransactionType,
} from '@/types/finance'
import type {
  CreateFinanceCategoryData,
  CreateFinanceTransactionData,
  UpdateFinanceTransactionData,
  UpsertFinanceBudgetData,
} from '@/lib/validations/finance'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

export interface FinanceFilters {
  type?: FinanceTransactionType
  from?: string
  to?: string
  category?: string
  currency?: FinanceCurrency
}

export async function getFinanceTransactions(
  supabase: SupabaseClient,
  userId: string,
  filters: FinanceFilters = {},
): Promise<Result<FinanceTransaction[]>> {
  let query = supabase
    .from('finance_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.type) query = query.eq('type', filters.type)
  if (filters.from) query = query.gte('occurred_at', filters.from)
  if (filters.to) query = query.lte('occurred_at', filters.to)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.currency) query = query.eq('currency', filters.currency)

  const { data, error } = await query
  if (error) return err(error.message)
  return ok((data ?? []) as FinanceTransaction[])
}

export async function createFinanceTransaction(
  supabase: SupabaseClient,
  userId: string,
  input: CreateFinanceTransactionData,
): Promise<Result<FinanceTransaction>> {
  const { data, error } = await supabase
    .from('finance_transactions')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as FinanceTransaction)
}

export async function updateFinanceTransaction(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateFinanceTransactionData,
): Promise<Result<FinanceTransaction>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('finance_transactions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as FinanceTransaction)
}

export async function deleteFinanceTransaction(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('finance_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(true)
}

export async function getFinanceCategories(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<FinanceCategory[]>> {
  const { data, error } = await supabase
    .from('finance_categories')
    .select('*')
    .eq('user_id', userId)
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) return err(error.message)
  return ok((data ?? []) as FinanceCategory[])
}

export async function createFinanceCategory(
  supabase: SupabaseClient,
  userId: string,
  input: CreateFinanceCategoryData,
): Promise<Result<FinanceCategory>> {
  const { data, error } = await supabase
    .from('finance_categories')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as FinanceCategory)
}

export async function deleteFinanceCategory(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('finance_categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(true)
}

export async function getFinanceSummary(
  supabase: SupabaseClient,
  userId: string,
  from?: string,
  to?: string,
): Promise<Result<FinanceSummary[]>> {
  const { data, error } = await supabase.rpc('get_finance_summary', {
    p_user_id: userId,
    p_from: from ?? null,
    p_to: to ?? null,
  })

  if (error) return err(error.message)

  return ok((data ?? []).map((row: Record<string, unknown>) => ({
    currency: String(row.currency) as FinanceSummary['currency'],
    total_income: Number(row.total_income ?? 0),
    total_expense: Number(row.total_expense ?? 0),
    balance: Number(row.balance ?? 0),
    transaction_count: Number(row.transaction_count ?? 0),
  })))
}

export async function getFinanceCategorySummary(
  supabase: SupabaseClient,
  userId: string,
  from?: string,
  to?: string,
): Promise<Result<FinanceCategorySummary[]>> {
  const { data, error } = await supabase.rpc('get_finance_category_summary', {
    p_user_id: userId,
    p_from: from ?? null,
    p_to: to ?? null,
  })

  if (error) return err(error.message)

  return ok((data ?? []).map((row: Record<string, unknown>) => ({
    type: String(row.type) as FinanceCategorySummary['type'],
    category: String(row.category),
    currency: String(row.currency) as FinanceCategorySummary['currency'],
    total: Number(row.total ?? 0),
    transaction_count: Number(row.transaction_count ?? 0),
  })))
}

export async function getFinanceBudgets(
  supabase: SupabaseClient,
  userId: string,
  periodMonth: string,
): Promise<Result<FinanceBudget[]>> {
  const { data, error } = await supabase
    .from('finance_budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('period_month', `${periodMonth}-01`)
    .order('category', { ascending: true })

  if (error) return err(error.message)
  return ok((data ?? []) as FinanceBudget[])
}

export async function upsertFinanceBudget(
  supabase: SupabaseClient,
  userId: string,
  input: UpsertFinanceBudgetData,
): Promise<Result<FinanceBudget>> {
  const payload = {
    user_id: userId,
    category: input.category,
    currency: input.currency,
    amount: input.amount,
    period_month: `${input.period_month}-01`,
  }

  const query = input.id
    ? supabase.from('finance_budgets').update(payload).eq('id', input.id).eq('user_id', userId).select().single()
    : supabase.from('finance_budgets').upsert(payload, {
        onConflict: 'user_id,category,currency,period_month',
      }).select().single()

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as FinanceBudget)
}

export async function deleteFinanceBudget(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('finance_budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(true)
}

export async function getFinanceBudgetStatus(
  supabase: SupabaseClient,
  userId: string,
  periodMonth: string,
): Promise<Result<FinanceBudgetStatus[]>> {
  const { data, error } = await supabase.rpc('get_finance_budget_status', {
    p_user_id: userId,
    p_period_month: `${periodMonth}-01`,
  })

  if (error) return err(error.message)

  return ok((data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    category: String(row.category),
    currency: String(row.currency) as FinanceBudgetStatus['currency'],
    budget_amount: Number(row.budget_amount ?? 0),
    spent_amount: Number(row.spent_amount ?? 0),
    remaining_amount: Number(row.remaining_amount ?? 0),
    usage_rate: Number(row.usage_rate ?? 0),
  })))
}
