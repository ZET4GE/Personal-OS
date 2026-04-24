'use client'

import { useRef } from 'react'
import { Activity, Clock3, Orbit, Sparkles, Target } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'

const FLOATING_NOTES = [
  {
    icon: Target,
    title: 'Meta activa',
    detail: 'Curso AWS',
    position: 'left-[-1rem] top-[12%] sm:left-[-2.5rem]',
    accent: 'from-accent-500/30 to-cyan-500/10',
  },
  {
    icon: Clock3,
    title: 'Tiempo de hoy',
    detail: '02h 14m',
    position: 'right-[-0.4rem] top-[6%] sm:right-[-2rem]',
    accent: 'from-violet-500/30 to-accent-500/10',
  },
  {
    icon: Activity,
    title: 'Habitos',
    detail: '4/5 completos',
    position: 'bottom-[12%] left-[4%] sm:left-[-1rem]',
    accent: 'from-emerald-500/30 to-accent-500/10',
  },
  {
    icon: Orbit,
    title: 'Roadmap',
    detail: 'Siguiente paso listo',
    position: 'bottom-[-0.5rem] right-[8%] sm:right-[-1rem]',
    accent: 'from-sky-500/30 to-violet-500/10',
  },
]

export function HeroShowcase() {
  const frameRef  = useRef<HTMLDivElement | null>(null)
  const rafPending = useRef(false)

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (rafPending.current) return
    rafPending.current = true

    const clientX = event.clientX
    const clientY = event.clientY

    requestAnimationFrame(() => {
      rafPending.current = false
      const node = frameRef.current
      if (!node) return

      const rect = node.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height
      const rotateY = (x - 0.5) * 10
      const rotateX = (0.5 - y) * 10

      node.style.setProperty('--hero-rotate-x', `${rotateX.toFixed(2)}deg`)
      node.style.setProperty('--hero-rotate-y', `${rotateY.toFixed(2)}deg`)
      node.style.setProperty('--hero-shine-x', `${(x * 100).toFixed(1)}%`)
      node.style.setProperty('--hero-shine-y', `${(y * 100).toFixed(1)}%`)
    })
  }

  function resetMove() {
    const node = frameRef.current
    if (!node) return
    node.style.setProperty('--hero-rotate-x', '0deg')
    node.style.setProperty('--hero-rotate-y', '0deg')
    node.style.setProperty('--hero-shine-x', '50%')
    node.style.setProperty('--hero-shine-y', '24%')
  }

  return (
    <div className="relative mx-auto w-full max-w-[38rem] perspective-[1800px]">
      <div
        ref={frameRef}
        onMouseMove={handleMove}
        onMouseLeave={resetMove}
        className="group relative [--hero-rotate-x:0deg] [--hero-rotate-y:0deg] [--hero-shine-x:50%] [--hero-shine-y:24%]"
      >
        <div
          className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_var(--hero-shine-x)_var(--hero-shine-y),rgba(59,130,246,0.14),transparent_34%),linear-gradient(135deg,rgba(59,130,246,0.08),transparent_48%,rgba(139,92,246,0.08))] blur-2xl transition-transform duration-150 ease-out dark:bg-[radial-gradient(circle_at_var(--hero-shine-x)_var(--hero-shine-y),rgba(59,130,246,0.22),transparent_34%),linear-gradient(135deg,rgba(59,130,246,0.14),transparent_48%,rgba(139,92,246,0.12))]"
          style={{
            transform: 'translate3d(0, 0, 0) scale(1.02)',
          }}
        />

        <div
          className="relative transition-transform duration-150 ease-out will-change-transform"
          style={{
            transform: 'rotateX(var(--hero-rotate-x)) rotateY(var(--hero-rotate-y))',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-[0_40px_120px_-40px_rgba(15,23,42,0.9)]" />
          <DashboardMockup />
        </div>

        {FLOATING_NOTES.map((note, index) => (
          <div
            key={note.title}
            className={[
              'pointer-events-none absolute hidden w-44 rounded-2xl border border-slate-200/50 bg-slate-50/60 p-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-transform duration-150 ease-out dark:border-white/10 dark:bg-surface/80 dark:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)] sm:block',
              note.position,
            ].join(' ')}
            style={{
              transform: `translate3d(0, 0, ${18 + index * 6}px)`,
            }}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${note.accent} opacity-70`} />
            <div className="relative flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/8">
                <note.icon size={16} className="text-accent-300" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{note.title}</p>
                <p className="mt-1 text-sm font-semibold text-text">{note.detail}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200/50 bg-slate-50/62 px-3 py-1.5 text-[11px] text-slate-600 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/75 dark:text-muted">
          <Sparkles size={12} className="text-accent-400" />
          Fondo y panel reaccionan al movimiento del mouse
        </div>
      </div>
    </div>
  )
}
