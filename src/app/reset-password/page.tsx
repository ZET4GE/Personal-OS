'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WINFLogo } from '@/components/brand/WINFLogo'

type Stage = 'verifying' | 'ready' | 'error'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [stage,     setStage]     = useState<Stage>('verifying')
  const [errMsg,    setErrMsg]    = useState('')
  const [password,  setPassword]  = useState('')
  const [show,      setShow]      = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Step 1 — verify OTP from email link params
  useEffect(() => {
    const token_hash = searchParams.get('token_hash')
    const type       = searchParams.get('type')

    if (!token_hash || type !== 'recovery') {
      setErrMsg('Enlace inválido o expirado.')
      setStage('error')
      return
    }

    const supabase = createClient()
    supabase.auth
      .verifyOtp({ token_hash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setErrMsg(error.message)
          setStage('error')
        } else {
          setStage('ready')
        }
      })
  }, [searchParams])

  // Step 2 — update password using the now-active session
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setFormError('Mínimo 8 caracteres'); return }
    setFormError('')
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setFormError(error.message)
      setSubmitting(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <WINFLogo markClassName="h-7 w-7 text-text" wordmarkClassName="text-sm font-semibold text-text" />

        {stage === 'verifying' && (
          <div className="space-y-2 text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-600" />
            <p className="text-sm text-muted">Verificando enlace...</p>
          </div>
        )}

        {stage === 'error' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-medium text-red-500">Enlace inválido o expirado</p>
              <p className="mt-1 text-xs text-muted">{errMsg}</p>
            </div>
            <Link
              href="/?modal=login"
              className="block text-center text-sm text-accent-600 hover:underline dark:text-accent-400"
            >
              Volver al inicio
            </Link>
          </div>
        )}

        {stage === 'ready' && (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text">Nueva contraseña</h1>
              <p className="mt-1 text-sm text-muted">Ingresá tu nueva contraseña para continuar.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={submitting}
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

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 disabled:opacity-50"
              >
                {submitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
