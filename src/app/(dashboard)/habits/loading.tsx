import { Skeleton } from '@/components/ui/Skeleton'

export default function HabitsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Day navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-1.5 w-full rounded-full" />

      {/* Habit cards */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="flex flex-col items-center gap-0.5">
                    <Skeleton className="h-2 w-2" />
                    <Skeleton className="h-4 w-4 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
