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
  profileUsername?: string | null
  profileIsPublic?: boolean
  enabledModules: EnabledModule[]
  showProductTour: boolean
  isAdmin?: boolean
  children: React.ReactNode
}

export function DashboardShell({
  userEmail,
  userName,
  userAvatarUrl,
  profileUsername,
  profileIsPublic,
  enabledModules,
  showProductTour,
  isAdmin,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-shell relative flex min-h-screen">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-accent-500/[0.06] blur-3xl dark:bg-accent-500/[0.10]" />
      <div aria-hidden className="pointer-events-none fixed -bottom-20 -left-20 -z-10 h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-3xl dark:bg-violet-500/[0.07]" />
      <div aria-hidden className="pointer-events-none fixed bottom-1/3 right-1/4 -z-10 h-[360px] w-[360px] rounded-full bg-cyan-500/[0.03] blur-3xl dark:bg-cyan-500/[0.05]" />

      <Sidebar collapsed={collapsed} enabledModules={enabledModules} isAdmin={isAdmin} />

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
          profileUsername={profileUsername}
          profileIsPublic={profileIsPublic}
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
