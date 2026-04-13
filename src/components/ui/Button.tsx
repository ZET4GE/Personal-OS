import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

const VARIANT_CLS: Record<Variant, string> = {
  primary:
    'bg-accent-600 text-white shadow-sm hover:bg-accent-700 ' +
    'active:scale-[0.97] disabled:opacity-50',
  secondary:
    'border border-border bg-surface text-foreground shadow-sm ' +
    'hover:bg-surface-hover active:scale-[0.97] disabled:opacity-50',
  ghost:
    'text-muted hover:bg-surface-hover hover:text-foreground ' +
    'active:scale-[0.97] disabled:opacity-40',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 ' +
    'active:scale-[0.97] disabled:opacity-50',
}

const SIZE_CLS: Record<Size, string> = {
  sm: 'h-7  px-3   text-xs  gap-1.5 rounded-md',
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
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50',
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
