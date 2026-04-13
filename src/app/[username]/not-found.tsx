import Link from 'next/link'
import { UserRound } from 'lucide-react'

export default function ProfileNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <UserRound size={28} className="text-muted" />
      </span>
      <h1 className="text-xl font-semibold">Perfil no encontrado</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        El username que buscas no existe o este perfil es privado.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
