type Color = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'orange'
type Size  = 'sm' | 'md'

const COLOR_CLS: Record<Color, string> = {
  default: 'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-300',
  blue:    'bg-blue-50    text-blue-700   dark:bg-blue-900/30  dark:text-blue-300',
  green:   'bg-green-50   text-green-700  dark:bg-green-900/30 dark:text-green-300',
  amber:   'bg-amber-50   text-amber-700  dark:bg-amber-900/30 dark:text-amber-300',
  red:     'bg-red-50     text-red-700    dark:bg-red-900/30   dark:text-red-300',
  purple:  'bg-purple-50  text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  teal:    'bg-teal-50    text-teal-700   dark:bg-teal-900/30  dark:text-teal-300',
  orange:  'bg-orange-50  text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const SIZE_CLS: Record<Size, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] rounded',
  md: 'px-2   py-0.5 text-xs     rounded-md',
}

interface BadgeProps {
  color?:    Color
  size?:     Size
  dot?:      boolean
  children:  React.ReactNode
  className?: string
}

export function Badge({ color = 'default', size = 'md', dot, children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${COLOR_CLS[color]} ${SIZE_CLS[size]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
