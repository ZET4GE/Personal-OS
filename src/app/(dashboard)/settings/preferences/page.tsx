import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { LanguageSwitcherFull } from '@/components/ui/LanguageSwitcherFull'

export const metadata: Metadata = { title: 'Preferencias' }

export default async function PreferencesPage() {
  const t      = await getTranslations('settings')
  const locale = await getLocale()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      {/* Tab nav */}
      <nav className="flex gap-1 border-b border-border">
        <Link
          href="/settings"
          className="px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          {t('profile')}
        </Link>
        <span className="relative px-4 py-2 text-sm font-medium text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-500">
          {t('preferences')}
        </span>
      </nav>

      {/* Language section */}
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
