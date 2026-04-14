// Static SVG/div mockup of the dashboard — avoids screenshots while still
// conveying the product's structure.

export function DashboardMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-3 flex-1 rounded bg-surface-3 px-3 py-0.5 text-[10px] text-muted">
          winf.com.ar/dashboard
        </div>
      </div>

      {/* Dashboard shell */}
      <div className="flex h-[340px] sm:h-[400px]">
        {/* Sidebar */}
        <aside className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-border bg-surface py-4 sm:flex">
          <div className="h-6 w-6 rounded-md bg-accent-600/90" />
          <div className="mt-2 flex flex-col gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className={`h-5 w-5 rounded ${i === 0 ? 'bg-accent-600/30' : 'bg-surface-3'}`} />
            ))}
          </div>
        </aside>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div className="flex h-10 items-center justify-between border-b border-border px-4">
            <div className="h-2.5 w-24 rounded bg-surface-3" />
            <div className="flex gap-2">
              <div className="h-5 w-5 rounded-full bg-surface-3" />
              <div className="h-5 w-5 rounded-full bg-surface-3" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-4 space-y-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {[
                { label: 'Empleos', val: '12', accent: true },
                { label: 'Proyectos', val: '5' },
                { label: 'Clientes', val: '3' },
                { label: 'Ingresos', val: '$2.4k' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-surface-2 p-2">
                  <div className={`text-base font-bold ${s.accent ? 'text-accent-500' : 'text-text'}`}>
                    {s.val}
                  </div>
                  <div className="text-[10px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Two-col */}
            <div className="grid grid-cols-2 gap-2">
              {/* Hábitos */}
              <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-20 rounded bg-surface-3" />
                  <div className="h-2 w-12 rounded bg-accent-600/20" />
                </div>
                {['Ejercicio', 'Leer', 'Meditar'].map((h, i) => (
                  <div key={h} className="flex items-center gap-2">
                    <div className={`h-3.5 w-3.5 rounded-full border ${i < 2 ? 'border-emerald-500 bg-emerald-500/20' : 'border-border'}`} />
                    <div className="h-2 rounded bg-surface-3" style={{ width: `${50 + i * 15}%` }} />
                  </div>
                ))}
              </div>
              {/* Deadlines */}
              <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
                <div className="h-2.5 w-24 rounded bg-surface-3" />
                {['Diseño Web', 'App Móvil', 'API REST'].map((p, i) => (
                  <div key={p} className="flex items-center justify-between">
                    <div className="h-2 rounded bg-surface-3" style={{ width: '55%' }} />
                    <div className={`h-4 rounded-full px-1.5 text-[9px] leading-4 ${i === 0 ? 'bg-red-500/10 text-red-400' : 'bg-surface-3 text-muted'}`}>
                      {i === 0 ? '2d' : i === 1 ? '5d' : '14d'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity bar */}
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="mb-2 h-2.5 w-28 rounded bg-surface-3" />
              <div className="flex items-end gap-1 h-10">
                {[40,65,30,80,55,90,45,70,35,85,60,75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-accent-600/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
