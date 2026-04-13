import { Skeleton } from './Skeleton'

export function JobCardSkeleton() {
  return (
    <div
      className="rounded-xl border bg-surface p-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />

        {/* Info */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Status badge */}
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
