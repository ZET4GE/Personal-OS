import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserOnboarding } from '@/types/onboarding'

type Ok<T> = { data: T; error: null }
type Err = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (message: string): Err => ({ data: null, error: message })

export async function getUserOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<UserOnboarding | null>> {
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return err(error.message)
  return ok((data ?? null) as UserOnboarding | null)
}
