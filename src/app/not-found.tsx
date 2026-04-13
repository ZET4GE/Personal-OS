import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <FileQuestion size={28} className="text-muted" />
      </span>

      <p className="text-5xl font-bold text-accent-600">404</p>
      <h1 className="mt-3 text-xl font-semibold">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        La página que buscas no existe o fue eliminada.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Ir al inicio
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Dashboard
        </Link>
      </div>
    </main>
  )
}
