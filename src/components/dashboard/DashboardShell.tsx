'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { QuickCapture } from '@/components/notes/QuickCapture'
import { GuidedProductTour } from '@/components/onboarding/GuidedProductTour'
import type { EnabledModule } from '@/types/onboarding'

interface DashboardShellProps {
  userEmail: string
  userName?: string
  userAvatarUrl?: string | null
  enabledModules: EnabledModule[]
  showProductTour: boolean
  children: React.ReactNode
}

export function DashboardShell({
  userEmail,
  userName,
  userAvatarUrl,
  enabledModules,
  showProductTour,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="relative flex min-h-screen">
      {/* Subtle ambient glow — top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent-600/[0.04] blur-3xl dark:bg-accent-600/[0.07]"
      />

      <Sidebar collapsed={collapsed} enabledModules={enabledModules} />

      <div
        className={[
          'flex flex-1 flex-col transition-all duration-200',
          collapsed ? 'md:ml-14' : 'md:ml-60',
        ].join(' ')}
      >
        <Topbar
          userEmail={userEmail}
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <QuickCapture />
      <GuidedProductTour defaultOpen={showProductTour} />
    </div>
  )
}
