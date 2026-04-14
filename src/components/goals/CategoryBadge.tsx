import { CATEGORY_META } from '@/types/goals'
import type { GoalCategory } from '@/types/goals'

const COLOR_CLASSES: Record<string, string> = {
  purple: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  blue:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber:  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  cyan:   'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

interface CategoryBadgeProps {
  category: GoalCategory
  size?:    'sm' | 'md'
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category]
  const colorCls = COLOR_CLASSES[meta.color] ?? COLOR_CLASSES.blue
  const padding  = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${colorCls}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  )
}
