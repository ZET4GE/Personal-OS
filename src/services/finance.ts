import type { SupabaseClient } from '@supabase/supabase-js'
import type { FinanceSummary, FinanceTransaction, FinanceTransactionType } from '@/types/finance'
import type {
  CreateFinanceTransactionData,
  UpdateFinanceTransactionData,
} from '@/lib/validations/finance'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

export async function getFinanceTransactions(
  supabase: SupabaseClient,
  type?: FinanceTransactionType,
): Promise<Result<FinanceTransaction[]>> {
  let query = supabase
    .from('finance_transactions')
    .select('*')
    .order('occurred_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

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
  input: UpdateFinanceTransactionData,
): Promise<Result<FinanceTransaction>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('finance_transactions')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as FinanceTransaction)
}

export async function deleteFinanceTransaction(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('finance_transactions')
    .delete()
    .eq('id', id)

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
