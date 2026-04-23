'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Plan = 'free' | 'pro' | 'team'

export async function assignPlan(
  userId: string,
  plan: Plan,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'No autenticado' }
  if (user.app_metadata?.role !== 'admin') {
    return { success: false, error: 'Sin permisos de administrador' }
  }

  const admin = createAdminClient()

  if (plan === 'free') {
    const { error } = await admin
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/users')
    return { success: true }
  }

  const { error } = await admin.from('user_subscriptions').upsert(
    {
      user_id: userId,
      plan,
      status: 'active',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/users')
  return { success: true }
}
