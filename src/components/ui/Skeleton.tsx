interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite_ease-in-out] bg-gradient-to-r from-transparent via-white/30 to-transparent dark:via-white/8" />
    </div>
  )
}
