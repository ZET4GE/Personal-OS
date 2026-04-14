'use client'

import { ArrowRight } from 'lucide-react'
import { useAuthModal } from '@/stores/auth-modal.store'
import type { AuthModalMode } from '@/stores/auth-modal.store'

interface AuthCTAButtonProps {
  mode?:      AuthModalMode
  label?:     string
  className?: string
  arrow?:     boolean
}

export function AuthCTAButton({
  mode      = 'signup',
  label     = 'Comenzar gratis',
  className = '',
  arrow     = true,
}: AuthCTAButtonProps) {
  const { openModal } = useAuthModal()

  return (
    <button
      type="button"
      onClick={() => openModal(mode)}
      className={[
        'group inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/20 transition-all hover:bg-accent-700 hover:shadow-xl hover:shadow-accent-600/30 active:scale-[0.98]',
        className,
      ].join(' ')}
    >
      {label}
      {arrow && (
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  )
}

export function AuthTextButton({
  mode = 'login',
  label = 'Iniciar sesión',
  className = '',
}: {
  mode?: AuthModalMode; label?: string; className?: string
}) {
  const { openModal } = useAuthModal()
  return (
    <button
      type="button"
      onClick={() => openModal(mode)}
      className={className}
    >
      {label}
    </button>
  )
}
