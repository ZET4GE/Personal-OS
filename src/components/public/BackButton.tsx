import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href: string
  label: string
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft size={15} />
      {label}
    </Link>
  )
}
