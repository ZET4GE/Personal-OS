'use client'

import { LayoutDashboard, Briefcase, FolderOpen, FileText, Settings, X, BarChart3, Users, Wallet, Target, ListChecks } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { NavLink } from './NavLink'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/jobs',      icon: Briefcase,       label: 'Empleos' },
  { href: '/projects',  icon: FolderOpen,      label: 'Proyectos' },
  { href: '/clients',   icon: Users,           label: 'Clientes' },
  { href: '/freelance', icon: Wallet,          label: 'Freelance' },
  { href: '/habits',    icon: Target,          label: 'Hábitos' },
  { href: '/routines',  icon: ListChecks,      label: 'Rutinas' },
  { href: '/cv',        icon: FileText,        label: 'CV' },
  { href: '/analytics', icon: BarChart3,       label: 'Analytics' },
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
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-surface transition-all duration-200',
          // Ancho: colapsado = 56px, normal = 240px
          collapsed ? 'w-14' : 'w-60',
          // Móvil: ocultar cuando cerrado
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Header del sidebar */}
        <div
          className={[
            'flex h-14 shrink-0 items-center border-b px-3',
            collapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">Personal OS</span>
          )}
          {collapsed && (
            <span className="text-sm font-bold text-accent-600">P</span>
          )}
          {/* Botón cerrar en móvil */}
          {!collapsed && (
            <button
              className="rounded p-1 text-slate-400 hover:text-slate-600 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav principal */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Nav inferior */}
        <div className="border-t p-2" style={{ borderColor: 'var(--color-border)' }}>
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} collapsed={collapsed} />
          ))}
        </div>
      </aside>
    </>
  )
}
