import { Skeleton } from '@/components/ui/Skeleton'
import { JobCardSkeleton } from '@/components/ui/JobCardSkeleton'

export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
