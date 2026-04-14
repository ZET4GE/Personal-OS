'use client'

import { usePathname } from 'next/navigation'
import {
  Menu, PanelLeft, LogOut,
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  BarChart3, Users, Wallet, Target, ListChecks, Settings, PenLine, Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/stores/ui.store'
import { logoutAction } from '@/app/(auth)/actions/auth.actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const PAGE_ICONS: Record<string, LucideIcon> = {
  '/dashboard':     LayoutDashboard,
  '/jobs':          Briefcase,
  '/projects':      FolderOpen,
  '/clients':       Users,
  '/freelance':     Wallet,
  '/habits':        Target,
  '/routines':      ListChecks,
  '/cv':            FileText,
  '/blog':          PenLine,
  '/analytics':     BarChart3,
  '/notifications': Bell,
  '/settings':      Settings,
}

type NavKey = 'dashboard' | 'jobs' | 'projects' | 'clients' | 'freelance' | 'habits' | 'routines' | 'cv' | 'blog' | 'analytics' | 'notifications' | 'settings'

const PAGE_NAV_KEYS: Record<string, NavKey> = {
  '/dashboard':     'dashboard',
  '/jobs':          'jobs',
  '/projects':      'projects',
  '/clients':       'clients',
  '/freelance':     'freelance',
  '/habits':        'habits',
  '/routines':      'routines',
  '/cv':            'cv',
  '/blog':          'blog',
  '/analytics':     'analytics',
  '/notifications': 'notifications',
  '/settings':      'settings',
}

function getPageInfo(pathname: string): { icon: LucideIcon; key: NavKey } {
  if (PAGE_ICONS[pathname]) {
    return { icon: PAGE_ICONS[pathname], key: PAGE_NAV_KEYS[pathname] }
  }
  const match = Object.keys(PAGE_ICONS)
    .filter((k) => k !== '/dashboard' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return match
    ? { icon: PAGE_ICONS[match], key: PAGE_NAV_KEYS[match] }
    : { icon: LayoutDashboard, key: 'dashboard' }
}

function UserAvatar({ name, email }: { name?: string; email: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white shadow-sm ring-2 ring-accent-600/20"
      title={name ?? email}
    >
      {initials}
    </div>
  )
}

interface TopbarProps {
  userEmail:        string
  userName?:        string
  collapsed:        boolean
  onToggleCollapse: () => void
}

export function Topbar({ userEmail, userName, collapsed, onToggleCollapse }: TopbarProps) {
  const pathname           = usePathname()
  const { setSidebarOpen } = useUIStore()
  const tNav               = useTranslations('nav')
  const tAuth              = useTranslations('auth')

  const { icon: PageIcon, key: navKey } = getPageInfo(pathname)
  const title = tNav(navKey)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-surface px-4">
      {/* Toggle sidebar en desktop */}
      <button
        className="hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        <PanelLeft size={17} />
      </button>

      {/* Hamburger en móvil */}
      <button
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={17} />
      </button>

      {/* Título con icono */}
      <div className="flex flex-1 items-center gap-2">
        <PageIcon size={16} className="text-muted shrink-0" />
        <h1 className="text-sm font-semibold">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-5 w-px bg-border" />
        <UserAvatar name={userName} email={userEmail} />
        <span className="hidden text-xs text-muted sm:block max-w-[140px] truncate ml-1">
          {userName ?? userEmail}
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            title={tAuth('logout')}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{tAuth('logout')}</span>
          </button>
        </form>
      </div>
    </header>
  )
}
