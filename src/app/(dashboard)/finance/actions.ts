'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateFinanceCategorySchema,
  CreateFinanceTransactionSchema,
  UpdateFinanceTransactionSchema,
  UpsertFinanceBudgetSchema,
} from '@/lib/validations/finance'
import {
  createFinanceCategory,
  createFinanceTransaction,
  deleteFinanceBudget,
  deleteFinanceCategory,
  deleteFinanceTransaction,
  updateFinanceTransaction,
  upsertFinanceBudget,
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
  const { supabase, user } = await getAuthedClient()

  const parsed = UpdateFinanceTransactionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const result = await updateFinanceTransaction(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { transaction: result.data! }
}

export async function deleteFinanceTransactionAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deleteFinanceTransaction(supabase, user.id, id)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { ok: true }
}

export async function createFinanceCategoryAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = CreateFinanceCategorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const result = await createFinanceCategory(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { category: result.data! }
}

export async function upsertFinanceBudgetAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const parsed = UpsertFinanceBudgetSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const result = await upsertFinanceBudget(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { budget: result.data! }
}

export async function deleteFinanceCategoryAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deleteFinanceCategory(supabase, user.id, id)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { ok: true }
}

export async function deleteFinanceBudgetAction(formData: FormData): Promise<FinanceActionResult> {
  const { supabase, user } = await getAuthedClient()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'ID requerido' }

  const result = await deleteFinanceBudget(supabase, user.id, id)
  if (result.error) return { error: result.error }

  revalidatePath('/finance')
  return { ok: true }
}
