import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Habits & Streak Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex h-[50px] items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border bg-surface p-6">
            <Skeleton className="mb-2 h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="mt-1 h-3 w-24" />
            <Skeleton className="mt-4 h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Deadlines & Payments Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex h-[60px] flex-col justify-center rounded-lg border border-border p-3">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex h-[60px] flex-col justify-center rounded-lg border border-border p-3">
                <div className="flex justify-between mb-2">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="grid grid-cols-1">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <Skeleton className="h-4 w-36" />
          <div className="relative pl-3 mt-2">
            <div className="absolute bottom-4 left-5 top-4 w-px bg-border"></div>
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative flex gap-4">
                  <Skeleton className="relative z-10 h-5 w-5 rounded-full" />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
