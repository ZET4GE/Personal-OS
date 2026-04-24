import type { HTMLAttributes } from 'react'

type Variant = 'default' | 'elevated' | 'ghost'

const VARIANT_CLS: Record<Variant, string> = {
  default:  'app-card',
  elevated: 'app-card border-slate-200/75 bg-white/80 dark:border-white/10 dark:bg-surface/80 shadow-[0_20px_56px_-28px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.07)]',
  ghost:    'bg-transparent',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:   Variant
  hoverable?: boolean
}

export function Card({
  variant = 'default',
  hoverable = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl transition-all duration-200',
        VARIANT_CLS[variant],
        hoverable ? 'app-card-hover cursor-pointer' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 pt-5 pb-0 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 pb-5 pt-0 ${className}`} {...rest}>
      {children}
    </div>
  )
}
