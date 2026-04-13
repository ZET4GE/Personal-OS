'use client'

import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle size={24} className="text-red-500" />
      </span>

      <h2 className="text-lg font-semibold">Algo salió mal</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        No se pudo cargar esta sección. Puedes intentar de nuevo o volver al dashboard.
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
          href="/dashboard"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
