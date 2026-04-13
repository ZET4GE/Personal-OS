import { Skeleton } from '@/components/ui/Skeleton'

function SectionCardSkeleton() {
  return (
    <div
      className="flex items-center justify-between rounded-xl border bg-surface p-5"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

export default function CVLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="space-y-3">
        <SectionCardSkeleton />
        <SectionCardSkeleton />
        <SectionCardSkeleton />
      </div>
    </div>
  )
}
