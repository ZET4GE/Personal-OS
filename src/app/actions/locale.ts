'use server'

import { cookies } from 'next/headers'
import { locales, LOCALE_COOKIE } from '@/i18n/config'

export async function setLocaleAction(locale: string): Promise<void> {
  if (!locales.includes(locale as typeof locales[number])) return

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path:    '/',
    maxAge:  365 * 24 * 60 * 60,   // 1 year
    sameSite: 'lax',
    secure:  process.env.NODE_ENV === 'production',
  })
}
