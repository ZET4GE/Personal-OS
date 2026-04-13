'use client'

import {
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  Settings, X, BarChart3, Users, Wallet, Target, ListChecks,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { NavLink } from './NavLink'

const NAV_GROUPS = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'TRABAJO',
    items: [
      { href: '/jobs',      icon: Briefcase,  label: 'Empleos'   },
      { href: '/projects',  icon: FolderOpen, label: 'Proyectos' },
      { href: '/clients',   icon: Users,      label: 'Clientes'  },
      { href: '/freelance', icon: Wallet,     label: 'Freelance' },
    ],
  },
  {
    label: 'PERSONAL',
    items: [
      { href: '/habits',   icon: Target,     label: 'Hábitos'  },
      { href: '/routines', icon: ListChecks, label: 'Rutinas'  },
    ],
  },
  {
    label: 'PERFIL',
    items: [
      { href: '/cv',        icon: FileText,  label: 'CV'        },
      { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
] as const

const BOTTOM_ITEMS = [
  { href: '/settings', icon: Settings, label: 'Configuración' },
] as const

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

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
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-surface transition-all duration-200',
          collapsed ? 'w-14' : 'w-60',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Header */}
        <div
          className={[
            'flex h-14 shrink-0 items-center border-b px-3',
            collapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          {collapsed ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-xs font-bold text-white shadow-sm">
              P
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-xs font-bold text-white shadow-sm">
                  P
                </div>
                <span className="text-sm font-semibold tracking-tight">Personal OS</span>
              </div>
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
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-1 px-2.5 text-[10px] font-semibold tracking-widest text-muted/60 uppercase select-none">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Nav inferior */}
        <div className="border-t px-2 py-2">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </div>
      </aside>
    </>
  )
}
