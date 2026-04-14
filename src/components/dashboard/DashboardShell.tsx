'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { QuickCapture } from '@/components/notes/QuickCapture'

interface DashboardShellProps {
  userEmail: string
  userName?: string
  children: React.ReactNode
}

// Wrapper client que mantiene el estado de colapso del sidebar.
// El layout (Server Component) lo renderiza y le pasa los datos del usuario.
export function DashboardShell({ userEmail, userName, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} />

      {/* Área principal — se desplaza cuando el sidebar está visible */}
      <div
        className={[
          'flex flex-1 flex-col transition-all duration-200',
          // En desktop: margen izquierdo igual al ancho del sidebar
          collapsed ? 'md:ml-14' : 'md:ml-60',
        ].join(' ')}
      >
        <Topbar
          userEmail={userEmail}
          userName={userName}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <QuickCapture />
    </div>
  )
}
