import { Skeleton } from '@/components/ui/Skeleton'
import { ExperienceCardSkeleton } from '@/components/ui/ExperienceCardSkeleton'

export default function ExperienceLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-2 rounded-none" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ExperienceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
