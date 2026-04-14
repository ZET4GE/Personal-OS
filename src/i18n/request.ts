import { getRequestConfig } from 'next-intl/server'
import { cookies }          from 'next/headers'
import { locales, defaultLocale, LOCALE_COOKIE } from './config'

export default getRequestConfig(async () => {
  const cookieStore  = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as string | undefined
  const locale       = locales.includes(cookieLocale as typeof locales[number])
    ? (cookieLocale as typeof locales[number])
    : defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
