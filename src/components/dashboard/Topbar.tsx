'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu, PanelLeft, LogOut,
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  BarChart3, Users, Wallet, Banknote, Target, ListChecks, Settings, PenLine, Bell, StickyNote, Crosshair, Clock3, HelpCircle, ArrowUpRight, Check, Copy, Share2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useUIStore } from '@/stores/ui.store'
import { logoutAction } from '@/app/(auth)/actions/auth.actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { FloatingTimer } from '@/components/timer/FloatingTimer'

const PAGE_ICONS: Record<string, LucideIcon> = {
  '/dashboard':     LayoutDashboard,
  '/jobs':          Briefcase,
  '/projects':      FolderOpen,
  '/clients':       Users,
  '/freelance':     Wallet,
  '/finance':       Banknote,
  '/habits':        Target,
  '/routines':      ListChecks,
  '/time':          Clock3,
  '/goals':         Crosshair,
  '/cv':            FileText,
  '/blog':          PenLine,
  '/analytics':     BarChart3,
  '/notifications': Bell,
  '/notes':         StickyNote,
  '/settings':      Settings,
  '/help':          HelpCircle,
}

type NavKey = 'dashboard' | 'jobs' | 'projects' | 'clients' | 'freelance' | 'finance' | 'habits' | 'routines' | 'time' | 'goals' | 'cv' | 'blog' | 'analytics' | 'notifications' | 'notes' | 'settings' | 'help'

const PAGE_NAV_KEYS: Record<string, NavKey> = {
  '/dashboard':     'dashboard',
  '/jobs':          'jobs',
  '/projects':      'projects',
  '/clients':       'clients',
  '/freelance':     'freelance',
  '/finance':       'finance',
  '/habits':        'habits',
  '/routines':      'routines',
  '/time':          'time',
  '/goals':         'goals',
  '/cv':            'cv',
  '/blog':          'blog',
  '/analytics':     'analytics',
  '/notifications': 'notifications',
  '/notes':         'notes',
  '/settings':      'settings',
  '/help':          'help',
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

function UserAvatar({ name, email, avatarUrl }: { name?: string; email: string; avatarUrl?: string | null }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? email}
        className="h-7 w-7 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-border"
        title={name ?? email}
      />
    )
  }

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
  userAvatarUrl?:   string | null
  profileUsername?: string | null
  profileIsPublic?: boolean
  collapsed:        boolean
  onToggleCollapse: () => void
}

export function Topbar({
  userEmail,
  userName,
  userAvatarUrl,
  profileUsername,
  profileIsPublic,
  collapsed,
  onToggleCollapse,
}: TopbarProps) {
  const pathname           = usePathname()
  const { setSidebarOpen } = useUIStore()
  const tNav               = useTranslations('nav')
  const tAuth              = useTranslations('auth')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const { icon: PageIcon, key: navKey } = getPageInfo(pathname)
  const title = tNav(navKey)
  const profileHref = profileUsername ? `/${profileUsername}` : '/settings'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function getProfileUrl() {
    if (!profileUsername || typeof window === 'undefined') return null
    return new URL(`/${profileUsername}`, window.location.origin).toString()
  }

  async function handleShareProfile() {
    const url = getProfileUrl()
    if (!url) return

    if (!profileIsPublic) {
      toast.info('Tu perfil esta privado. Si lo compartis, nadie lo vera hasta publicarlo.')
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${userName ?? profileUsername}`,
          text: 'Mira mi perfil en WINF',
          url,
        })
        setProfileMenuOpen(false)
        return
      } catch {
        // fallback to clipboard below
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setProfileMenuOpen(false)
    toast.success('Link copiado')
    setTimeout(() => setCopied(false), 1800)
  }

  async function handleCopyProfile() {
    const url = getProfileUrl()
    if (!url) return

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setProfileMenuOpen(false)
    toast.success('Link copiado')
    setTimeout(() => setCopied(false), 1800)
  }

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

      <div className="hidden lg:block" data-tour="global-search">
        <GlobalSearch />
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-0.5">
        <div data-tour="timer">
          <FloatingTimer />
        </div>
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />

        <div className="mx-2 h-5 w-px bg-border" />

        {/* User */}
        <div ref={profileMenuRef} className="relative flex items-center gap-1.5">
          <Link
            href={profileHref}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-hover"
            title="Ver mi perfil"
          >
            <UserAvatar name={userName} email={userEmail} avatarUrl={userAvatarUrl} />
            <span className="hidden max-w-[120px] truncate text-xs font-medium text-text sm:block">
              {userName?.split(' ')[0] ?? userEmail.split('@')[0]}
            </span>
          </Link>

          {profileUsername && (
            <>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                title={copied ? 'Link copiado' : 'Compartir perfil'}
                aria-label="Compartir perfil"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-surface-elevated p-2 shadow-xl backdrop-blur-sm">
                  <Link
                    href={profileHref}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text transition-colors hover:bg-surface-hover"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <ArrowUpRight size={14} className="text-accent-500" />
                    Ver mi perfil
                  </Link>
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-hover"
                  >
                    <Share2 size={14} className="text-accent-500" />
                    Compartir por redes
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyProfile}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-hover"
                  >
                    <Copy size={14} className="text-accent-500" />
                    Copiar link
                  </button>
                  {!profileIsPublic && (
                    <p className="px-3 pt-2 text-[11px] leading-5 text-amber-500">
                      Tu perfil esta privado. Publicalo en configuracion para compartirlo.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
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
