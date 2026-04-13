import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/services/profiles'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: profile } = await getMyProfile(supabase)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Perfil público</h2>
        <p className="text-sm text-muted">
          Personaliza tu perfil y controla qué ven los visitantes.
        </p>
      </div>

      <ProfileSettingsForm profile={profile} />
    </div>
  )
}
