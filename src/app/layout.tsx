import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default:  'WINF',
    template: '%s | WINF',
  },
  description: 'Work in One Framework: metas, proyectos, habitos, tiempo y perfil publico en un solo lugar.',
  icons: {
    icon: '/winf-mark.svg',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://winf.com.ar',
  ),
  openGraph: {
    siteName: 'WINF',
    locale:   'es_AR',
  },
}

// Inline script runs synchronously before React hydrates — prevents flash of wrong theme.
const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
  } catch(e){}
})();
`.trim()

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale   = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      {/* suppressHydrationWarning: needed because the inline script mutates the class
          attribute before React hydrates, causing a mismatch that is safe to ignore. */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster
          richColors
          position="bottom-right"
          duration={3500}
          toastOptions={{ style: { fontFamily: 'var(--font-geist-sans)' } }}
        />
      </body>
    </html>
  )
}
