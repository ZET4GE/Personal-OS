'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const TABS = [
  { href: '/settings',             key: 'profile'      },
  { href: '/settings/preferences', key: 'preferences'  },
  { href: '/settings/integrations',key: 'integrations' },
] as const

export function SettingsNav() {
  const pathname = usePathname()
  const t        = useTranslations('settings')

  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map(({ href, key }) => {
        const isActive = pathname === href
        return isActive ? (
          <span
            key={href}
            className="relative px-4 py-2 text-sm font-medium text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-500"
          >
            {t(key)}
          </span>
        ) : (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            {t(key)}
          </Link>
        )
      })}
    </nav>
  )
}
