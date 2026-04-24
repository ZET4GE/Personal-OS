'use client'

import { useState } from 'react'
import { Briefcase, FileText, LayoutDashboard, Sparkles } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'
import { AuthCTAButton } from './AuthCTAButton'
import { Reveal } from './Reveal'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cv',        label: 'CV Builder', icon: FileText },
  { id: 'jobs',      label: 'Job Tracker', icon: Briefcase },
] as const

type TabId = (typeof TABS)[number]['id']

// ─── CV Builder mockup ────────────────────────────────────────

function CVMockup() {
  const SKILLS = ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS']
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-[0_40px_120px_-40px_rgba(2,8,23,0.95)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.14),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(139,92,246,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-2 flex-1 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] tracking-[0.18em] text-slate-400">
            winf.com.ar/cv
          </div>
        </div>
      </div>

      <div className="flex h-[350px] sm:h-[420px]">
        {/* Editor */}
        <div className="flex w-[44%] shrink-0 flex-col gap-3 border-r border-white/8 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Datos personales</p>
          <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
            <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-slate-500">Nombre</p>
            <p className="text-sm text-slate-200">Carlos Méndez</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2">
            <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-slate-500">Headline</p>
            <p className="text-sm text-slate-200">Backend Engineer · Node.js</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Experiencia</p>
          <div className="rounded-xl border border-amber-400/18 bg-amber-500/8 px-3 py-2">
            <p className="text-sm font-medium text-slate-200">Software Developer</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Acme Corp · 2022 – Presente</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 opacity-55">
            <p className="text-sm text-slate-300">Backend Engineer</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Startup XYZ · 2020 – 2022</p>
          </div>
          <div className="mt-auto flex gap-2">
            <button className="flex-1 rounded-xl border border-amber-400/22 bg-amber-500/10 py-2 text-[10px] font-medium text-amber-200">
              PDF Visual
            </button>
            <button className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] py-2 text-[10px] text-slate-400">
              ATS · EN/ES
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 p-4">
          <div className="flex h-full flex-col rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
            <div className="border-b border-white/8 pb-3">
              <p className="text-base font-semibold text-slate-100">Carlos Méndez</p>
              <p className="text-xs text-slate-400">Backend Engineer · Node.js</p>
              <p className="mt-1 text-[10px] text-slate-500">Buenos Aires · github.com/cmendev</p>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                Experiencia
              </p>
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs font-medium text-slate-200">Software Developer</p>
                    <p className="text-[10px] text-slate-500">2022–hoy</p>
                  </div>
                  <p className="text-[10px] text-slate-400">Acme Corp</p>
                </div>
                <div className="opacity-55">
                  <p className="text-xs font-medium text-slate-200">Backend Engineer</p>
                  <p className="text-[10px] text-slate-400">Startup XYZ · 2020–2022</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Skills</p>
              <div className="flex flex-wrap gap-1">
                {SKILLS.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[9px] text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Job Tracker mockup ───────────────────────────────────────

const JOB_COLUMNS = [
  {
    label: 'Aplicada',
    color: 'text-blue-300',
    accent: 'from-blue-500/14',
    badge: 'bg-blue-500/12 text-blue-200',
    jobs: [
      { company: 'Globant', role: 'Senior Node Dev' },
      { company: 'Mercado Libre', role: 'Backend Engineer' },
    ],
  },
  {
    label: 'Entrevista',
    color: 'text-violet-300',
    accent: 'from-violet-500/14',
    badge: 'bg-violet-500/12 text-violet-200',
    jobs: [
      { company: 'Naranja X', role: 'Node.js Developer' },
    ],
  },
  {
    label: 'Oferta',
    color: 'text-emerald-300',
    accent: 'from-emerald-500/14',
    badge: 'bg-emerald-500/12 text-emerald-200',
    jobs: [
      { company: 'TechCo', role: 'FullStack Dev' },
    ],
  },
] as const

function JobsMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-[0_40px_120px_-40px_rgba(2,8,23,0.95)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_78%_15%,rgba(139,92,246,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-2 flex-1 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] tracking-[0.18em] text-slate-400">
            winf.com.ar/jobs
          </div>
        </div>
      </div>

      <div className="relative flex h-[350px] flex-col p-4 sm:h-[420px]">
        {/* Metrics strip */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Aplicadas', value: '12' },
            { label: 'Entrevistas', value: '3' },
            { label: 'Ofertas', value: '1' },
            { label: 'Tasa resp.', value: '33%' },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-center">
              <p className="text-base font-semibold text-slate-100 sm:text-lg">{m.value}</p>
              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Kanban */}
        <div className="grid flex-1 min-h-0 grid-cols-3 gap-3">
          {JOB_COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col gap-2 overflow-hidden rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${col.color}`}>
                  {col.label}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${col.badge}`}>
                  {col.jobs.length}
                </span>
              </div>
              <div className="space-y-2">
                {col.jobs.map((job) => (
                  <div
                    key={job.company}
                    className={`relative overflow-hidden rounded-xl border border-white/8 bg-gradient-to-br ${col.accent} to-transparent p-2.5`}
                  >
                    <p className="text-xs font-medium text-slate-200">{job.role}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{job.company}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-dashed border-white/10 py-2 text-center text-[10px] text-slate-600">
                  + Agregar
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab content ──────────────────────────────────────────────

function TabContent({ tab }: { tab: TabId }) {
  if (tab === 'dashboard') return <DashboardMockup />
  if (tab === 'cv') return <CVMockup />
  return <JobsMockup />
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
