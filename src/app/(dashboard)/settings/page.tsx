import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBillingStatus } from '@/services/billing'
import { getMyProfile } from '@/services/profiles'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'
import { SettingsNav } from '@/components/settings/SettingsNav'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const t        = await getTranslations('settings')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, billingResult] = await Promise.all([
    getMyProfile(supabase),
    user ? getBillingStatus(supabase, user.id) : Promise.resolve({ data: null, error: 'No autenticado' }),
  ])

  const canCustomizePortfolio = Boolean(
    billingResult.data &&
      billingResult.data.plan !== 'free' &&
      ['active', 'trialing'].includes(billingResult.data.status),
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <SettingsNav />

      <p className="text-sm text-muted">{t('profileDesc')}</p>

      <ProfileSettingsForm profile={profile} canCustomizePortfolio={canCustomizePortfolio} />
    </div>
  )
}
