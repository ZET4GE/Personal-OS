'use client'

import { usePathname } from 'next/navigation'
import {
  Menu, PanelLeft, LogOut,
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  BarChart3, Users, Wallet, Target, ListChecks, Settings, PenLine, Bell, StickyNote, Crosshair,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/stores/ui.store'
import { logoutAction } from '@/app/(auth)/actions/auth.actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'

const PAGE_ICONS: Record<string, LucideIcon> = {
  '/dashboard':     LayoutDashboard,
  '/jobs':          Briefcase,
  '/projects':      FolderOpen,
  '/clients':       Users,
  '/freelance':     Wallet,
  '/habits':        Target,
  '/routines':      ListChecks,
  '/goals':         Crosshair,
  '/cv':            FileText,
  '/blog':          PenLine,
  '/analytics':     BarChart3,
  '/notifications': Bell,
  '/notes':         StickyNote,
  '/settings':      Settings,
}

type NavKey = 'dashboard' | 'jobs' | 'projects' | 'clients' | 'freelance' | 'habits' | 'routines' | 'goals' | 'cv' | 'blog' | 'analytics' | 'notifications' | 'notes' | 'settings'

const PAGE_NAV_KEYS: Record<string, NavKey> = {
  '/dashboard':     'dashboard',
  '/jobs':          'jobs',
  '/projects':      'projects',
  '/clients':       'clients',
  '/freelance':     'freelance',
  '/habits':        'habits',
  '/routines':      'routines',
  '/goals':         'goals',
  '/cv':            'cv',
  '/blog':          'blog',
  '/analytics':     'analytics',
  '/notifications': 'notifications',
  '/notes':         'notes',
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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-violet-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-border"
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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-sm">
      {/* Collapse toggle — desktop */}
      <button
        className="hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        <PanelLeft size={16} />
      </button>

      {/* Hamburger — mobile */}
      <button
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={16} />
      </button>

      {/* Page title */}
      <div className="flex flex-1 items-center gap-2">
        <PageIcon size={15} className="shrink-0 text-accent-600 dark:text-accent-400" />
        <h1 className="text-sm font-semibold text-text">{title}</h1>
      </div>

      <div className="hidden lg:block">
        <GlobalSearch />
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-0.5">
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />

        <div className="mx-2 h-5 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-2">
          <UserAvatar name={userName} email={userEmail} />
          <span className="hidden max-w-[120px] truncate text-xs font-medium text-text sm:block">
            {userName?.split(' ')[0] ?? userEmail.split('@')[0]}
          </span>
        </div>

        <form action={logoutAction} className="ml-1">
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            title={tAuth('logout')}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{tAuth('logout')}</span>
          </button>
        </form>
      </div>
    </header>
  )
}
