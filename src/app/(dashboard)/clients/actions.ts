'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateClientSchema, UpdateClientSchema } from '@/lib/validations/clients'
import { createClient_ as createClientSvc, updateClient, deleteClient } from '@/services/clients'
import type { ClientActionResult } from '@/types/clients'

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function createClientAction(formData: FormData): Promise<ClientActionResult> {
  const { supabase, user } = await getAuthed()
  const parsed = CreateClientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createClientSvc(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/clients')
  return { client: result.data! }
}

export async function updateClientAction(formData: FormData): Promise<ClientActionResult> {
  const { supabase } = await getAuthed()
  const parsed = UpdateClientSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateClient(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/clients')
  revalidatePath(`/clients/${parsed.data.id}`)
  return { client: result.data! }
}

export async function deleteClientAction(formData: FormData): Promise<ClientActionResult> {
  const { supabase } = await getAuthed()
  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const { error } = await deleteClient(supabase, id)
  if (error) return { error }

  revalidatePath('/clients')
  return { ok: true }
}
