import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserTechStack, TechCategory } from '@/types/tech-stack'

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

export async function getTechStack(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<UserTechStack[]>> {
  const { data, error } = await supabase
    .from('user_tech_stack')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  if (error) return err(error.message)
  return ok(data as UserTechStack[])
}

export async function addTechToStack(
  supabase: SupabaseClient,
  userId: string,
  input: { tech_name: string; tech_slug: string; category: TechCategory },
): Promise<Result<UserTechStack>> {
  // Get current max order to append at end
  const { data: existing } = await supabase
    .from('user_tech_stack')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (existing?.display_order ?? -1) + 1

  const { data, error } = await supabase
    .from('user_tech_stack')
    .insert({ user_id: userId, ...input, display_order: nextOrder })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as UserTechStack)
}

export async function removeTechFromStack(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<null>> {
  const { error } = await supabase
    .from('user_tech_stack')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(null)
}

export async function reorderTechStack(
  supabase: SupabaseClient,
  userId: string,
  orderedIds: string[],
): Promise<Result<null>> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('user_tech_stack')
      .update({ display_order: index, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId),
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return err(failed.error.message)
  return ok(null)
}
