'use client'

import {
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  Settings, X, BarChart3, Users, Wallet, Target, ListChecks, PenLine, StickyNote, Crosshair, GitBranch,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useUIStore } from '@/stores/ui.store'
import { NavLink } from './NavLink'
import type { EnabledModule } from '@/types/onboarding'
import { WINFLogo } from '@/components/brand/WINFLogo'

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  module?: EnabledModule
}

type NavGroup = {
  label: string
  items: NavItem[]
}

export function Sidebar({ collapsed, enabledModules }: { collapsed: boolean; enabledModules: EnabledModule[] }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const t = useTranslations('nav')
  const enabled = new Set(enabledModules)

  const NAV_GROUPS: NavGroup[] = [
    {
      label: 'PRINCIPAL',
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { href: '/goals',    icon: Crosshair,  label: t('goals')    },
        { href: '/roadmaps', icon: GitBranch, label: t('roadmaps') },
      ],
    },
    {
      label: 'ACCION',
      items: [
        { href: '/projects',  icon: FolderOpen, label: t('projects'), module: 'projects' },
        { href: '/habits',   icon: Target,     label: t('habits'), module: 'habits' },
        { href: '/routines', icon: ListChecks, label: t('routines'), module: 'routines' },
      ],
    },
    {
      label: 'TRABAJO',
      items: [
        { href: '/jobs',      icon: Briefcase,  label: t('jobs'), module: 'jobs' },
        { href: '/clients',   icon: Users,      label: t('clients'), module: 'clients' },
        { href: '/freelance', icon: Wallet,     label: t('freelance'), module: 'freelance' },
      ],
    },
    {
      label: 'CONOCIMIENTO',
      items: [
        { href: '/notes', icon: StickyNote, label: t('notes'), module: 'notes' },
      ],
    },
    {
      label: 'PERFIL PUBLICO',
      items: [
        { href: '/cv',        icon: FileText,  label: t('cv'), module: 'cv' },
        { href: '/blog',      icon: PenLine,   label: t('blog'), module: 'blog' },
        { href: '/analytics', icon: BarChart3, label: t('analytics'), module: 'analytics' },
      ],
    },
  ]

  const BOTTOM_ITEMS = [
    { href: '/settings', icon: Settings, label: t('settings') },
  ] as const

  return (
    <>
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border transition-all duration-200',
          // Subtle gradient background
          'bg-gradient-to-b from-surface to-surface dark:from-zinc-900 dark:to-zinc-950',
          collapsed ? 'w-14' : 'w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Header */}
        <div
          className={[
            'flex h-14 shrink-0 items-center border-b border-border px-3',
            collapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          {collapsed ? (
            <WINFLogo showWordmark={false} markClassName="h-7 w-7 text-text" />
          ) : (
            <>
              <WINFLogo markClassName="h-7 w-7 text-text" wordmarkClassName="text-sm font-semibold tracking-tight text-text" />
              <button
                className="rounded-md p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar sidebar"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>

        {/* Nav principal con grupos */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3 gap-4">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.module || enabled.has(item.module))
            if (visibleItems.length === 0) return null

            return (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold tracking-widest text-muted/50 uppercase select-none">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <NavLink key={item.href} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          )})}
        </nav>

        {/* Nav inferior */}
        <div className="border-t border-border px-2 py-2">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </div>
      </aside>
    </>
  )
}
