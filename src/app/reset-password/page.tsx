'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { updatePasswordAction } from '@/app/(auth)/actions/auth.actions'

export default function ResetPasswordPage() {
  const [state, action, isPending] = useActionState(updatePasswordAction, null)
  const [show, setShow] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-xs font-bold text-white">P</div>
          <span className="text-sm font-semibold text-text">Personal OS</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-muted">Ingresá tu nueva contraseña para continuar.</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Nueva contraseña</label>
            <div className="relative">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 pr-10 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 disabled:opacity-50"
          >
            {isPending ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
