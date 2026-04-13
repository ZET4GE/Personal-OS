import { Skeleton } from '@/components/ui/Skeleton'

export default function FreelanceLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-48" /><Skeleton className="h-6 w-20 rounded-full" /></div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
