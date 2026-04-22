import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClientProject, ProjectStatusClient } from '@/types/clients'
import type {
  CreateClientProjectData,
  UpdateClientProjectData,
} from '@/lib/validations/clients'

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err
const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// Selección con join al cliente
const SELECT_WITH_CLIENT = `
  *,
  client:clients ( id, name, company )
`

export async function getClientProjects(
  supabase: SupabaseClient,
  statusFilter?: ProjectStatusClient,
): Promise<Result<ClientProject[]>> {
  let query = supabase
    .from('client_projects')
    .select(SELECT_WITH_CLIENT)
    .order('updated_at', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as ClientProject[])
}

export async function getProjectsByClient(
  supabase: SupabaseClient,
  clientId: string,
): Promise<Result<ClientProject[]>> {
  const { data, error } = await supabase
    .from('client_projects')
    .select(SELECT_WITH_CLIENT)
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as ClientProject[])
}

export async function getClientProjectById(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<ClientProject>> {
  const { data, error } = await supabase
    .from('client_projects')
    .select(SELECT_WITH_CLIENT)
    .eq('id', id)
    .single()

  if (error || !data) return err('Proyecto no encontrado')
  return ok(data as ClientProject)
}

export async function createClientProject(
  supabase: SupabaseClient,
  userId: string,
  input: CreateClientProjectData,
): Promise<Result<ClientProject>> {
  if (input.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', input.client_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!client) return err('Cliente no encontrado')
  }

  const { data, error } = await supabase
    .from('client_projects')
    .insert({ ...input, user_id: userId })
    .select(SELECT_WITH_CLIENT)
    .single()

  if (error) return err(error.message)
  return ok(data as ClientProject)
}

export async function updateClientProject(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateClientProjectData,
): Promise<Result<ClientProject>> {
  const { id, ...patch } = input

  if (patch.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', patch.client_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!client) return err('Cliente no encontrado')
  }

  const { data, error } = await supabase
    .from('client_projects')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select(SELECT_WITH_CLIENT)
    .single()

  if (error) return err(error.message)
  return ok(data as ClientProject)
}

export async function updateClientProjectStatus(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  status: ProjectStatusClient,
): Promise<Result<true>> {
  const patch: Record<string, unknown> = { status }
  if (status === 'completed') patch.completed_at = new Date().toISOString()

  const { error } = await supabase
    .from('client_projects')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(true as const)
}

export async function deleteClientProject(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('client_projects').delete().eq('id', id).eq('user_id', userId)
  if (error) return err(error.message)
  return ok(true as const)
}
