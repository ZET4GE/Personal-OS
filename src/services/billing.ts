import type { SupabaseClient } from '@supabase/supabase-js'
import type { BillingStatus, BillingUsageLimit } from '@/types/billing'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

export async function getBillingStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<BillingStatus>> {
  const { data, error } = await supabase.rpc('get_user_billing_status', {
    p_user_id: userId,
  })

  if (error) return err(error.message)

  const row = Array.isArray(data) ? data[0] : data

  return ok({
    plan: row?.plan ?? 'free',
    status: row?.status ?? 'active',
    current_period_end: row?.current_period_end ?? null,
  } as BillingStatus)
}

export async function getBillingUsageLimits(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<BillingUsageLimit[]>> {
  const { data, error } = await supabase.rpc('get_user_usage_limits', {
    p_user_id: userId,
  })

  if (error) return err(error.message)

  return ok((data ?? []).map((row: Record<string, unknown>) => ({
    resource: String(row.resource),
    used_count: Number(row.used_count ?? 0),
    limit_count: row.limit_count === null ? null : Number(row.limit_count),
    is_limited: Boolean(row.is_limited),
  })))
}
