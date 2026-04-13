'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { UpdateProfileSchema } from '@/lib/validations/profiles'
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

  const result = await updateProfile(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  const profile = result.data!
  revalidatePath('/settings')
  revalidatePath(`/${profile.username}`)

  return { ok: true, profile }
}
