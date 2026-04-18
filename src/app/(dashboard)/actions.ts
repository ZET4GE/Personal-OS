'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function completeProductTourAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Sesion no valida' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('user_onboarding')
    .upsert(
      {
        user_id: user.id,
        tour_completed: true,
        tour_completed_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    )

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { ok: true }
}
