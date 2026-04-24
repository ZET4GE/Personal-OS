export default function RoadmapDetailLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="h-5 w-40 animate-pulse rounded-full bg-surface-elevated" />
        <div className="mt-4 h-8 w-72 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-surface-elevated" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
      </section>

      <section className="h-[420px] animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  )
}
