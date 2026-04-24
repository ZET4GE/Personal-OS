export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-36 animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-48 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-hover" />
      </div>

      {/* group skeleton */}
      {['Hoy', 'Esta semana'].map((label) => (
        <section key={label}>
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-surface-hover" />
          <div className="space-y-0.5 rounded-xl border border-border bg-surface p-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-lg px-3 py-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-hover" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-surface-hover" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-surface-hover" />
                  <div className="h-2 w-1/4 animate-pulse rounded bg-surface-hover" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
