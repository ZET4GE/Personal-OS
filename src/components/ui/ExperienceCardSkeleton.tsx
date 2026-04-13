import { Skeleton } from './Skeleton'

export function ExperienceCardSkeleton() {
  return (
    <div
      className="rounded-xl border bg-surface p-5"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  )
}
