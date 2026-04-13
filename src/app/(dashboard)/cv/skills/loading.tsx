import { Skeleton } from '@/components/ui/Skeleton'

export default function SkillsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-2 rounded-none" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Add form skeleton */}
      <div
        className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed p-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Skill badge rows */}
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 + i }).map((_, j) => (
                <Skeleton key={j} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
