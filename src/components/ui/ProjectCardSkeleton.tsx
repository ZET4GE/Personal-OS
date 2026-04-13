import { Skeleton } from './Skeleton'

export function ProjectCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl border bg-surface"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
      <div
        className="border-t px-5 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}
