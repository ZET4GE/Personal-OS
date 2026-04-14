import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { LanguageSwitcherFull } from '@/components/ui/LanguageSwitcherFull'
import { SettingsNav } from '@/components/settings/SettingsNav'

export const metadata: Metadata = { title: 'Preferencias' }

export default async function PreferencesPage() {
  const t      = await getTranslations('settings')
  const locale = await getLocale()

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
    </div>
  )
}
