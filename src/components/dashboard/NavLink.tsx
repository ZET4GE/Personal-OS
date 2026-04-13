'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
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
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        collapsed ? 'justify-center px-2' : '',
        isActive
          ? 'bg-accent-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}
