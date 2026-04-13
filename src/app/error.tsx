'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle size={28} className="text-red-500" />
      </span>

      <h1 className="text-xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>

      {error.digest && (
        <p className="mt-1 font-mono text-xs text-muted opacity-60">{error.digest}</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw size={14} />
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
