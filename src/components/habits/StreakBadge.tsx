interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md'
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) return null

  const cls = size === 'sm'
    ? 'text-xs px-1.5 py-0.5 gap-0.5'
    : 'text-xs px-2 py-0.5 gap-1'

  return (
    <span className={`inline-flex items-center rounded-full bg-orange-100 font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 ${cls}`}>
      🔥 {streak}
    </span>
  )
}
