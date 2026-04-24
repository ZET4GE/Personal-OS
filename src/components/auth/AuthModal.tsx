'use client'

import { useEffect, useRef, useActionState } from 'react'
import { X, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAuthModal } from '@/stores/auth-modal.store'
import { loginAction, signupAction, forgotPasswordAction } from '@/app/(auth)/actions/auth.actions'
import { OAuthButtons } from './OAuthButtons'
import { WINFLogo } from '@/components/brand/WINFLogo'

// ─────────────────────────────────────────────────────────────
// Sub-forms
// ─────────────────────────────────────────────────────────────

function PasswordInput({
  name, placeholder, autoComplete, disabled,
}: {
  name: string; placeholder: string; autoComplete: string; disabled: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 pr-10 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
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
  )
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  const [state, action, isPending] = useActionState(loginAction, null)
  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Email</label>
        <input
          name="email" type="email" placeholder="tu@email.com" autoComplete="email" required
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Contraseña</label>
        <PasswordInput name="password" placeholder="••••••••" autoComplete="current-password" disabled={isPending} />
      </div>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <button
        type="submit" disabled={isPending}
        className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 disabled:opacity-50"
      >
        {isPending ? 'Iniciando...' : 'Iniciar sesión'}
      </button>
      <button type="button" onClick={onForgot} className="w-full text-center text-xs text-muted hover:text-foreground transition-colors">
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  )
}

function SignupForm() {
  const [state, action, isPending] = useActionState(signupAction, null)
  if (state?.success) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-3xl">📬</p>
        <p className="text-base font-semibold text-text">Revisá tu email</p>
        <p className="text-sm text-muted">Te enviamos un enlace de verificación. Podés cerrar esto.</p>
      </div>
    )
  }
  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Nombre completo</label>
        <input
          name="fullName" type="text" placeholder="Tu nombre" autoComplete="name" required
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Email</label>
        <input
          name="email" type="email" placeholder="tu@email.com" autoComplete="email" required
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted">Contraseña</label>
        <PasswordInput name="password" placeholder="Min. 8 caracteres" autoComplete="new-password" disabled={isPending} />
      </div>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <button
        type="submit" disabled={isPending}
        className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 disabled:opacity-50"
      >
        {isPending ? 'Creando cuenta...' : 'Crear cuenta gratis'}
      </button>
    </form>
  )
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [state, action, isPending] = useActionState(forgotPasswordAction, null)
  if (state?.success) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-3xl">📧</p>
        <p className="text-base font-semibold text-text">Revisá tu email</p>
        <p className="text-sm text-muted">Si el email existe, te enviamos un enlace para recuperar tu contraseña.</p>
        <button onClick={onBack} className="text-xs text-accent-600 hover:underline dark:text-accent-400">
          Volver al inicio de sesión
        </button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
        <ArrowLeft size={13} /> Volver
      </button>
      <div>
        <p className="text-base font-semibold text-text">Recuperar contraseña</p>
        <p className="text-xs text-muted mt-0.5">Te enviamos un link a tu email para que puedas resetear tu contraseña.</p>
      </div>
      <form action={action} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Email</label>
          <input
            name="email" type="email" placeholder="tu@email.com" autoComplete="email" required
            disabled={isPending}
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        <button
          type="submit" disabled={isPending}
          className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────

export function AuthModal() {
  const { open, mode, closeModal, setMode } = useAuthModal()
  const panelRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Trap keyboard Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModal])

  const showOAuth = mode !== 'forgot'
  const isForgot  = mode === 'forgot'

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closeModal}
        className={[
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel — slides in from right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-label={mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Crear cuenta' : 'Recuperar contraseña'}
        className={[
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <WINFLogo markClassName="h-7 w-7 text-text" wordmarkClassName="text-sm font-semibold text-text" />
          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isForgot ? (
            <ForgotForm onBack={() => setMode('login')} />
          ) : (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex rounded-xl border border-border bg-surface-elevated p-1">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={[
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-colors',
                      mode === m
                        ? 'bg-surface text-text shadow-sm'
                        : 'text-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                  </button>
                ))}
              </div>

              {/* OAuth */}
              {showOAuth && (
                <>
                  <OAuthButtons />
                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted">o con email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </>
              )}

              {/* Email form */}
              {mode === 'login'
                ? <LoginForm onForgot={() => setMode('forgot')} />
                : <SignupForm />
              }
            </div>
          )}
        </div>

        {/* Footer note */}
        {!isForgot && (
          <div className="border-t border-border px-6 py-3">
            <p className="text-center text-[11px] text-muted">
              Al continuar, aceptás los{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">Términos</a>
              {' '}y la{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">Política de privacidad</a>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
