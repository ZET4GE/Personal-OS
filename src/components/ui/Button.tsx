import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

const VARIANT_CLS: Record<Variant, string> = {
  primary:
    'bg-accent-600 text-white ' +
    'shadow-sm shadow-accent-600/20 ' +
    'hover:bg-accent-700 hover:shadow-md hover:shadow-accent-600/30 ' +
    'active:scale-[0.97] disabled:opacity-50 disabled:shadow-none',
  secondary:
    'border border-border bg-surface text-foreground ' +
    'shadow-[var(--shadow-card)] ' +
    'hover:bg-surface-hover hover:border-border-bright hover:shadow-[var(--shadow-card-hover)] ' +
    'active:scale-[0.97] disabled:opacity-50',
  ghost:
    'text-muted hover:bg-surface-hover hover:text-foreground ' +
    'active:scale-[0.97] disabled:opacity-40',
  danger:
    'bg-red-600 text-white shadow-sm shadow-red-600/20 ' +
    'hover:bg-red-700 hover:shadow-md hover:shadow-red-600/30 ' +
    'active:scale-[0.97] disabled:opacity-50',
}

const SIZE_CLS: Record<Size, string> = {
  sm: 'h-7  px-3   text-xs  gap-1.5 rounded-lg',
  md: 'h-9  px-4   text-sm  gap-2   rounded-lg',
  lg: 'h-11 px-5   text-sm  gap-2   rounded-xl font-semibold',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant
  size?:     Size
  loading?:  boolean
  icon?:     React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center font-medium transition-all duration-200 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-1',
          VARIANT_CLS[variant],
          SIZE_CLS[size],
          className,
        ].join(' ')}
        {...rest}
      >
        {loading
          ? <Loader2 size={14} className="animate-spin" />
          : icon
        }
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
