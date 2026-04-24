const SKILLS = ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS']

export function CVMockup() {
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
            <button type="button" className="flex-1 rounded-xl border border-amber-400/22 bg-amber-500/10 py-2 text-[10px] font-medium text-amber-200">
              PDF Visual
            </button>
            <button type="button" className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] py-2 text-[10px] text-slate-400">
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
