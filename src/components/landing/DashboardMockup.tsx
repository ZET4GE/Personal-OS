const STATS = [
  { label: 'Meta activa', value: '1', tone: 'from-accent-500/18 to-cyan-500/8' },
  { label: 'Tiempo hoy', value: '2.4h', tone: 'from-violet-500/18 to-accent-500/8' },
  { label: 'Habitos', value: '4/5', tone: 'from-emerald-500/18 to-accent-500/8' },
  { label: 'Progreso', value: '68%', tone: 'from-sky-500/18 to-violet-500/8' },
]

const HABITS = [
  { label: 'Estudiar AWS', done: true, width: '78%' },
  { label: 'Enviar propuestas', done: true, width: '62%' },
  { label: 'Actualizar CV', done: false, width: '48%' },
]

const ROADMAP = [
  { label: 'Fundamentos', active: true },
  { label: 'Proyecto real', active: false },
  { label: 'Aplicar a roles', active: false },
]

const BARS = [36, 52, 44, 78, 58, 82, 64, 72, 48, 88, 54, 69]

export function DashboardMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-[0_40px_120px_-40px_rgba(2,8,23,0.95)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(139,92,246,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%)]" />
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="relative border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-2 flex-1 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] tracking-[0.18em] text-slate-400">
            winf.com.ar/dashboard
          </div>
        </div>
      </div>

      <div className="flex h-[350px] sm:h-[420px]">
        <aside className="hidden w-[84px] shrink-0 border-r border-white/8 bg-black/15 px-3 py-4 sm:flex sm:flex-col">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/18 text-sm font-semibold text-white shadow-[0_14px_40px_-16px_rgba(59,130,246,0.75)]">
            W
          </div>

          <div className="mt-5 space-y-2">
            {['Inicio', 'Metas', 'Roadmap', 'Tiempo', 'Notas'].map((item, index) => (
              <div
                key={item}
                className={[
                  'rounded-2xl px-3 py-2 text-[10px] font-medium tracking-[0.16em]',
                  index === 0
                    ? 'border border-accent-400/20 bg-accent-500/16 text-accent-200'
                    : 'text-slate-500',
                ].join(' ')}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Focus</p>
            <p className="mt-1 text-xs font-semibold text-slate-100">AWS Journey</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Tu foco de hoy</p>
              <p className="mt-1 text-sm font-semibold text-white">Cumplir una meta sin perder contexto</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.05]" />
              <div className="h-8 w-8 rounded-full border border-white/10 bg-accent-500/18" />
            </div>
          </div>

          <div className="flex-1 space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.tone} opacity-80`} />
                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid h-[calc(100%-5.4rem)] min-h-0 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="grid min-h-0 gap-3">
                <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Meta activa</p>
                      <p className="mt-1 text-base font-semibold text-white">Curso AWS + proyecto real</p>
                    </div>
                    <span className="rounded-full border border-accent-400/20 bg-accent-500/12 px-3 py-1 text-[10px] font-medium text-accent-200">
                      Continuar
                    </span>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/[0.05]">
                    <div className="h-2 w-[68%] rounded-full bg-gradient-to-r from-accent-400 via-cyan-400 to-violet-400" />
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {ROADMAP.map((item) => (
                      <div
                        key={item.label}
                        className={[
                          'rounded-2xl border px-3 py-3',
                          item.active
                            ? 'border-accent-400/25 bg-accent-500/12'
                            : 'border-white/8 bg-black/10',
                        ].join(' ')}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Roadmap</p>
                        <p className="mt-1 text-sm font-medium text-slate-100">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="min-h-0 rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Actividad reciente</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Tiempo real</p>
                  </div>

                  <div className="mt-4 flex h-[120px] items-end gap-1.5">
                    {BARS.map((height, index) => (
                      <div key={index} className="flex-1 rounded-full bg-white/[0.04] p-[1px]">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-accent-500/30 via-cyan-400/55 to-white/60"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="min-h-0 rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Acciones de hoy</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Habitos y sistema</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    2 listas
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {HABITS.map((habit) => (
                    <div key={habit.label} className="rounded-2xl border border-white/8 bg-black/12 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={[
                              'h-3.5 w-3.5 shrink-0 rounded-full border',
                              habit.done
                                ? 'border-emerald-400 bg-emerald-400/20'
                                : 'border-slate-600 bg-transparent',
                            ].join(' ')}
                          />
                          <p className="truncate text-sm font-medium text-slate-100">{habit.label}</p>
                        </div>
                        <p className="text-xs text-slate-400">{habit.done ? 'Hecho' : 'Pendiente'}</p>
                      </div>

                      <div className="mt-3 h-1.5 rounded-full bg-white/[0.05]">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-accent-400 to-cyan-400"
                          style={{ width: habit.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
