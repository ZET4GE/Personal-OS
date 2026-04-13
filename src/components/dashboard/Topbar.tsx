'use client'

import { usePathname } from 'next/navigation'
import {
  Menu, PanelLeft, LogOut,
  LayoutDashboard, Briefcase, FolderOpen, FileText,
  BarChart3, Users, Wallet, Target, ListChecks, Settings, PenLine, Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { logoutAction } from '@/app/(auth)/actions/auth.actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const PAGE_CONFIG: Record<string, { title: string; icon: LucideIcon }> = {
  '/dashboard': { title: 'Dashboard',     icon: LayoutDashboard },
  '/jobs':      { title: 'Empleos',       icon: Briefcase       },
  '/projects':  { title: 'Proyectos',     icon: FolderOpen      },
  '/clients':   { title: 'Clientes',      icon: Users           },
  '/freelance': { title: 'Freelance',     icon: Wallet          },
  '/habits':    { title: 'Hábitos',       icon: Target          },
  '/routines':  { title: 'Rutinas',       icon: ListChecks      },
  '/cv':        { title: 'CV',            icon: FileText        },
  '/blog':      { title: 'Blog',          icon: PenLine         },
  '/analytics':      { title: 'Analytics',       icon: BarChart3 },
  '/notifications':  { title: 'Notificaciones',  icon: Bell      },
  '/settings':       { title: 'Configuración',   icon: Settings  },
}

function getPageConfig(pathname: string) {
  // Exact match first, then prefix match
  if (PAGE_CONFIG[pathname]) return PAGE_CONFIG[pathname]
  const match = Object.keys(PAGE_CONFIG)
    .filter((k) => k !== '/dashboard' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return match ? PAGE_CONFIG[match] : { title: 'Personal OS', icon: LayoutDashboard }
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
  const pathname         = usePathname()
  const { setSidebarOpen } = useUIStore()
  const { title, icon: PageIcon } = getPageConfig(pathname)

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
            title="Cerrar sesión"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </header>
  )
}
