'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { UpdateProfileSchema } from '@/lib/validations/profiles'
import { getBillingStatus } from '@/services/billing'
import { updateProfile } from '@/services/profiles'
import type { ProfileActionResult } from '@/types/profile'

export async function updateProfileAction(
  _prev: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const parsed = UpdateProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const billingResult = await getBillingStatus(supabase, user.id)
  const canCustomizePortfolio = Boolean(
    billingResult.data &&
      billingResult.data.plan !== 'free' &&
      ['active', 'trialing'].includes(billingResult.data.status),
  )

  const input = { ...parsed.data }

  if (!canCustomizePortfolio) {
    delete input.portfolio_font_style
    delete input.portfolio_background_style
    delete input.portfolio_card_style
    delete input.portfolio_accent_style
  }

  const result = await updateProfile(supabase, user.id, input)
  if (result.error) return { error: result.error }

  const profile = result.data!
  revalidatePath('/settings')
  revalidatePath(`/${profile.username}`)
  revalidatePath(`/${profile.username}/cv`)
  revalidatePath(`/${profile.username}/blog`)
  revalidatePath(`/${profile.username}/roadmaps`)

  return { ok: true, profile }
}
