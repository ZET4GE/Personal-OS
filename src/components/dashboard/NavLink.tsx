'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface NavLinkProps {
  href:       string
  icon:       LucideIcon
  label:      string
  collapsed?: boolean
}

export function NavLink({ href, icon: Icon, label, collapsed }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 select-none',
        collapsed ? 'justify-center px-2' : '',
        isActive
          ? 'bg-accent-600/10 text-accent-600 font-medium dark:bg-accent-600/15 dark:text-accent-400'
          : 'text-muted hover:bg-surface-hover hover:text-foreground',
      ].join(' ')}
    >
      {/* Active left bar */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent-600 dark:bg-accent-400" />
      )}

      <Icon
        size={16}
        className={[
          'shrink-0 transition-colors duration-200',
          isActive
            ? 'text-accent-600 dark:text-accent-400'
            : 'text-muted/70 group-hover:text-foreground',
        ].join(' ')}
      />
      {!collapsed && <span className="leading-none">{label}</span>}
    </Link>
  )
}
