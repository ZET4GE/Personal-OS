import { Skeleton } from '@/components/ui/Skeleton'
import { ProjectCardSkeleton } from '@/components/ui/ProjectCardSkeleton'

export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
