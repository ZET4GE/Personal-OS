'use client'

import { usePathname } from 'next/navigation'
import { Menu, PanelLeft, LogOut } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { logoutAction } from '@/app/(auth)/actions/auth.actions'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs':      'Empleos',
  '/projects':  'Proyectos',
  '/settings':  'Configuración',
}

interface TopbarProps {
  userEmail: string
  userName?: string
  collapsed: boolean
  onToggleCollapse: () => void
}

function UserAvatar({ name, email }: { name?: string; email: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white"
      title={name ?? email}
      aria-label={`Usuario: ${name ?? email}`}
    >
      {initials}
    </div>
  )
}

export function Topbar({ userEmail, userName, collapsed, onToggleCollapse }: TopbarProps) {
  const pathname = usePathname()
  const { setSidebarOpen } = useUIStore()
  const title = PAGE_TITLES[pathname] ?? 'Personal OS'

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b bg-surface px-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Toggle sidebar en desktop */}
      <button
        className="hidden rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 md:flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        <PanelLeft size={18} />
      </button>

      {/* Hamburger en móvil */}
      <button
        className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      {/* Título de página */}
      <h1 className="flex-1 text-sm font-semibold">{title}</h1>

      {/* Usuario + logout */}
      <div className="flex items-center gap-2">
        <UserAvatar name={userName} email={userEmail} />
        <span className="hidden text-xs text-slate-500 sm:block max-w-[140px] truncate">
          {userName ?? userEmail}
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
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
