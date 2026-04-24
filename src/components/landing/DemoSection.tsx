'use client'

import { useState, lazy, Suspense } from 'react'
import { Briefcase, FileText, LayoutDashboard, Sparkles } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'
import { AuthCTAButton } from './AuthCTAButton'
import { Reveal } from './Reveal'

const CVMockupLazy   = lazy(() => import('./mockups/CVMockup').then((m) => ({ default: m.CVMockup })))
const JobsMockupLazy = lazy(() => import('./mockups/JobsMockup').then((m) => ({ default: m.JobsMockup })))

function MockupSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-[2rem] border border-white/10 bg-[#07111f]/95" style={{ height: 420 }} />
  )
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cv',        label: 'CV Builder', icon: FileText },
  { id: 'jobs',      label: 'Job Tracker', icon: Briefcase },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── Tab content ──────────────────────────────────────────────

function TabContent({ tab }: { tab: TabId }) {
  if (tab === 'dashboard') return <DashboardMockup />
  if (tab === 'cv') return (
    <Suspense fallback={<MockupSkeleton />}>
      <CVMockupLazy />
    </Suspense>
  )
  return (
    <Suspense fallback={<MockupSkeleton />}>
      <JobsMockupLazy />
    </Suspense>
  )
}

// ─── Section ──────────────────────────────────────────────────

export function DemoSection() {
  const [active, setActive] = useState<TabId>('dashboard')

  return (
    <section className="relative py-20 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.13),transparent_55%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <Reveal className="mb-10 text-center sm:mb-12" distance={22}>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
            <Sparkles size={12} className="shrink-0" />
            Producto real
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">
            Mira como funciona WINF
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            No hay capturas retocadas. Es el sistema real que usas desde el primer día.
          </p>
        </Reveal>

        {/* Tabs */}
        <Reveal distance={16} delayMs={60}>
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/60 p-1.5 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:shadow-none">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    active === tab.id
                      ? 'bg-accent-600 text-white shadow-[0_4px_14px_-4px_rgba(59,130,246,0.5)]'
                      : 'text-muted hover:bg-surface-hover hover:text-text',
                  ].join(' ')}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Mockup frame */}
        <Reveal distance={24} delayMs={90}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[3rem] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.10),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.18),transparent_60%)]" />
            <div
              key={active}
              className="relative animate-in fade-in duration-300"
            >
              <TabContent tab={active} />
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal distance={16} delayMs={120} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <AuthCTAButton label="Crear tu espacio gratis" mode="signup" />
          <p className="text-xs text-muted">Sin tarjeta · Listo en 30 segundos</p>
        </Reveal>
      </div>
    </section>
  )
}
