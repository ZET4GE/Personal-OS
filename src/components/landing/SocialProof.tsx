import { Users, FolderOpen, PenLine, Target } from 'lucide-react'

const STATS = [
  { icon: Users,      value: '100+',  label: 'Profesionales activos' },
  { icon: FolderOpen, value: '500+',  label: 'Proyectos creados' },
  { icon: PenLine,    value: '1000+', label: 'Notas escritas' },
  { icon: Target,     value: '50k+',  label: 'Hábitos trackeados' },
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-surface-2 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Usado por profesionales de tecnología
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600/10">
                <s.icon size={18} className="text-accent-600" />
              </div>
              <div className="text-2xl font-bold text-text">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
