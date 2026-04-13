import { Skeleton } from './Skeleton'

const COL_WIDTHS = ['40%', '32%', '20%', '24%']

interface TableRowSkeletonProps {
  cols?: number
}

export function TableRowSkeleton({ cols = 4 }: TableRowSkeletonProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border bg-surface px-4 py-3"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ width: COL_WIDTHS[i % 4], flexShrink: 0 }}>
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}
