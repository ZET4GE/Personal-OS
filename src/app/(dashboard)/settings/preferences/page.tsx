import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { LanguageSwitcherFull } from '@/components/ui/LanguageSwitcherFull'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { ModulePreferencesForm } from '@/components/settings/ModulePreferencesForm'
import { createClient } from '@/lib/supabase/server'
import { getUserOnboarding } from '@/services/onboarding'

export const metadata: Metadata = { title: 'Preferencias' }

export default async function PreferencesPage() {
  const t      = await getTranslations('settings')
  const locale = await getLocale()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const onboardingResult = await getUserOnboarding(supabase, user.id)
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <SettingsNav />

      <section className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{t('language')}</h3>
          <p className="mt-0.5 text-sm text-muted">{t('languageDesc')}</p>
        </div>
        <LanguageSwitcherFull currentLocale={locale} />
      </section>

      <ModulePreferencesForm initialOnboarding={onboardingResult.data ?? null} goals={goals ?? []} />
    </div>
  )
}
