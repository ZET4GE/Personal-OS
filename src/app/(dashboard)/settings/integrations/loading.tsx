export default function IntegrationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="h-6 w-36 animate-pulse rounded bg-surface-3" />
      <div className="flex gap-1 border-b border-border pb-2">
        {[80, 90, 100].map((w) => (
          <div key={w} className={`h-8 w-${w === 80 ? '20' : w === 90 ? '24' : '28'} animate-pulse rounded bg-surface-3`} />
        ))}
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded bg-surface-3" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-3" />
              <div className="h-3 w-48 animate-pulse rounded bg-surface-3" />
            </div>
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-3" />
        </div>
      ))}
    </div>
  )
}
