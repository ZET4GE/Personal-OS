import { Skeleton } from '@/components/ui/Skeleton'

export default function BlogLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
