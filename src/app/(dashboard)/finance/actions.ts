'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateFinanceTransactionSchema,
  UpdateFinanceTransactionSchema,
} from '@/lib/validations/finance'
import {
  createFinanceTransaction,
  deleteFinanceTransaction,
  updateFinanceTransaction,
} from '@/services/finance'
import type { FinanceActionResult } from '@/types/finance'

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

export async function createFinanceTransactionAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = CreateFinanceTransactionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const result = await createFinanceTransaction(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { transaction: result.data! }
}

export async function updateFinanceTransactionAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase } = await getAuthedClient()

  const parsed = UpdateFinanceTransactionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const result = await updateFinanceTransaction(supabase, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { transaction: result.data! }
}

export async function deleteFinanceTransactionAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deleteFinanceTransaction(supabase, id)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { ok: true }
}
