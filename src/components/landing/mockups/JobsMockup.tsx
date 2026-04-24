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

export function JobsMockup() {
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
