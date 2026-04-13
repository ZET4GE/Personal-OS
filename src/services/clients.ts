import type { SupabaseClient } from '@supabase/supabase-js'
import type { Client } from '@/types/clients'
import type { CreateClientData, UpdateClientData } from '@/lib/validations/clients'

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err
const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

export async function getClients(supabase: SupabaseClient): Promise<Result<Client[]>> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  if (error) return err(error.message)
  return ok(data as Client[])
}

export async function getClientById(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<Client>> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return err('Cliente no encontrado')
  return ok(data as Client)
}

export async function createClient_(
  supabase: SupabaseClient,
  userId: string,
  input: CreateClientData,
): Promise<Result<Client>> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Client)
}

export async function updateClient(
  supabase: SupabaseClient,
  input: UpdateClientData,
): Promise<Result<Client>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('clients')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Client)
}

export async function deleteClient(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) return err(error.message)
  return ok(true as const)
}
