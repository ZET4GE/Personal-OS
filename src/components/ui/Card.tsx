import type { HTMLAttributes } from 'react'

type Variant = 'default' | 'elevated' | 'ghost'

const VARIANT_CLS: Record<Variant, string> = {
  default:  'border border-border bg-surface shadow-[var(--shadow-card)]',
  elevated: 'border border-border bg-surface shadow-[var(--shadow-card-hover)]',
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
        'rounded-xl transition-all duration-200',
        VARIANT_CLS[variant],
        hoverable
          ? 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-border-bright cursor-pointer'
          : '',
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
