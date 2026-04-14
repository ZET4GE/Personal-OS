'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { setLocaleAction } from '@/app/actions/locale'
import { locales } from '@/i18n/config'

const LOCALE_FLAGS: Record<string, string> = {
  es: '🇦🇷',
  en: '🇺🇸',
}

interface Props {
  currentLocale: string
}

export function LanguageSwitcherFull({ currentLocale }: Props) {
  const t                = useTranslations('settings')
  const router           = useRouter()
  const [pending, start] = useTransition()

  function select(locale: string) {
    if (locale === currentLocale) return
    start(async () => {
      await setLocaleAction(locale)
      router.refresh()
    })
  }

  const labels: Record<string, string> = {
    es: t('spanish'),
    en: t('english'),
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {locales.map((locale) => {
        const isActive = locale === currentLocale
        return (
          <button
            key={locale}
            onClick={() => select(locale)}
            disabled={pending}
            className={[
              'flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors disabled:opacity-60',
              isActive
                ? 'border-accent-500 bg-accent-500/5 text-text'
                : 'border-border bg-surface hover:bg-surface-2 text-text/70',
            ].join(' ')}
          >
            <span className="text-xl">{LOCALE_FLAGS[locale]}</span>
            <span className="flex-1 text-sm font-medium">{labels[locale]}</span>
            {isActive && <Check size={15} className="text-accent-500 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}
