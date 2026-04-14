'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { setLocaleAction } from '@/app/actions/locale'

export function LanguageSwitcher() {
  const locale  = useLocale()
  const router  = useRouter()
  const [pending, start] = useTransition()

  const next = locale === 'es' ? 'en' : 'es'

  function toggle() {
    start(async () => {
      await setLocaleAction(next)
      router.refresh()
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      className="flex h-7 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-xs font-semibold text-text/70 transition-colors hover:bg-surface-3 hover:text-text disabled:opacity-50"
    >
      {pending ? '…' : next.toUpperCase()}
    </button>
  )
}
