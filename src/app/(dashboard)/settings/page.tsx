import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/services/profiles'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'
import { SettingsNav } from '@/components/settings/SettingsNav'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const t        = await getTranslations('settings')
  const supabase = await createClient()
  const { data: profile } = await getMyProfile(supabase)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <SettingsNav />

      <p className="text-sm text-muted">{t('profileDesc')}</p>

      <ProfileSettingsForm profile={profile} />
    </div>
  )
}
