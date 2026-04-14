import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/services/profiles'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const t        = await getTranslations('settings')
  const supabase = await createClient()
  const { data: profile } = await getMyProfile(supabase)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      {/* Tab nav */}
      <nav className="flex gap-1 border-b border-border">
        <span className="relative px-4 py-2 text-sm font-medium text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-500">
          {t('profile')}
        </span>
        <Link
          href="/settings/preferences"
          className="px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          {t('preferences')}
        </Link>
      </nav>

      {/* Description */}
      <p className="text-sm text-muted">{t('profileDesc')}</p>

      <ProfileSettingsForm profile={profile} />
    </div>
  )
}
