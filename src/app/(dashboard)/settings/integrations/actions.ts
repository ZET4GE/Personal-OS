'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { removeIntegration } from '@/services/integrations'
import type { Provider } from '@/types/integrations'

export async function disconnectIntegrationAction(provider: Provider): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await removeIntegration(supabase, user.id, provider)
  revalidatePath('/settings/integrations')
  revalidatePath('/dashboard')
}
