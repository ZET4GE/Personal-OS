'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function ProfileSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const username = value.trim().replace(/^@/, '')
    if (username) router.push(`/${username}`)
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Buscador de perfiles
          </p>
          <h2 className="text-xl font-bold text-text sm:text-2xl">
            Encontrá el perfil de alguien
          </h2>
          <p className="mt-2 text-sm text-muted">
            Ingresá el username para ver su portafolio público.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                @
              </span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="username"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-8 pr-3 text-sm text-text placeholder:text-muted outline-none transition-colors focus:border-accent-600"
              />
            </div>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Search size={14} />
              Buscar
            </button>
          </form>

          {/* Quick example */}
          <p className="mt-3 text-xs text-muted">
            Ejemplo:{' '}
            <button
              type="button"
              onClick={() => router.push('/williams')}
              className="font-medium text-accent-600 hover:underline dark:text-accent-400"
            >
              @williams
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
