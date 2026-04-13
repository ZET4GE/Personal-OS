'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { AuthActionResult } from '@/types/auth'

interface Field {
  name: string
  label: string
  type: string
  placeholder?: string
  autoComplete?: string
}

interface AuthFormProps {
  mode: 'login' | 'signup'
  action: (
    prevState: AuthActionResult | null,
    formData: FormData,
  ) => Promise<AuthActionResult>
}

const FIELDS: Record<AuthFormProps['mode'], Field[]> = {
  login: [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
  ],
  signup: [
    { name: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ],
}

const COPY = {
  login: {
    title: 'Bienvenido de vuelta',
    subtitle: '¿No tienes cuenta?',
    linkText: 'Regístrate',
    linkHref: '/signup',
    submit: 'Iniciar sesión',
    submitting: 'Iniciando...',
  },
  signup: {
    title: 'Crear cuenta',
    subtitle: '¿Ya tienes cuenta?',
    linkText: 'Inicia sesión',
    linkHref: '/login',
    submit: 'Crear cuenta',
    submitting: 'Creando...',
  },
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null)
  const copy = COPY[mode]
  const fields = FIELDS[mode]

  // Signup exitoso — mostrar mensaje de verificación de email
  if (mode === 'signup' && state?.success) {
    return (
      <div className="text-center space-y-2">
        <p className="font-semibold text-lg">Revisa tu email</p>
        <p style={{ color: 'var(--color-muted)' }} className="text-sm">
          Te enviamos un enlace de verificación. Puedes cerrar esta página.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {copy.subtitle}{' '}
          <Link
            href={copy.linkHref}
            className="font-medium underline underline-offset-2"
            style={{ color: 'var(--color-accent-600)' }}
          >
            {copy.linkText}
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              required
              disabled={isPending}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                '--tw-ring-color': 'var(--color-accent-500)',
              } as React.CSSProperties}
            />
          </div>
        ))}

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent-600)' }}
        >
          {isPending ? copy.submitting : copy.submit}
        </button>
      </form>
    </div>
  )
}
