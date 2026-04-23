'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import { Reveal } from './Reveal'

export function ProfileSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const username = value.trim().replace(/^@/, '')
    if (username) router.push(`/${username}`)
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal distance={22}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface/60 p-6 backdrop-blur-xl sm:p-8">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.18),transparent_38%)] lg:block" />

            <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent-400">
                  Explorar perfiles
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-text sm:text-3xl">
                  Busca un perfil publico y entende rapido que esta construyendo esa persona.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                  Entra por username y accede a portfolio, CV, blog y roadmap publico desde una sola URL.
                </p>
              </div>

              <div>
                <form onSubmit={handleSearch} className="rounded-[1.5rem] border border-white/10 bg-black/10 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                        @
                      </span>
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="username"
                        className="h-12 w-full rounded-xl border border-white/10 bg-surface/75 pl-9 pr-4 text-sm text-text placeholder:text-muted outline-none transition-colors focus:border-accent-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!value.trim()}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 text-sm font-semibold text-white transition-all hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Search size={14} />
                      Buscar
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>Prueba rapida:</span>
                  {['@williams', '@demo', '@portfolio'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => router.push(`/${item.replace('@', '')}`)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:border-accent-500/30 hover:text-text"
                    >
                      {item}
                      <ArrowRight size={11} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
