import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProjectPayment } from '@/types/clients'
import type { CreatePaymentData } from '@/lib/validations/clients'

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err
const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

export async function getPaymentsByProject(
  supabase: SupabaseClient,
  projectId: string,
): Promise<Result<ProjectPayment[]>> {
  const { data, error } = await supabase
    .from('project_payments')
    .select('*')
    .eq('project_id', projectId)
    .order('payment_date', { ascending: false })

  if (error) return err(error.message)
  return ok(data as ProjectPayment[])
}

export async function createPayment(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePaymentData,
): Promise<Result<ProjectPayment>> {
  const { data: project } = await supabase
    .from('client_projects')
    .select('id')
    .eq('id', input.project_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!project) return err('Proyecto no encontrado')

  const { data, error } = await supabase
    .from('project_payments')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as ProjectPayment)
}

export async function deletePayment(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('project_payments').delete().eq('id', id).eq('user_id', userId)
  if (error) return err(error.message)
  return ok(true as const)
}
