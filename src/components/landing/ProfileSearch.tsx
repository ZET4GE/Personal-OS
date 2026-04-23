'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { Reveal } from './Reveal'

const QUICK_LINKS = ['@williams', '@demo', '@portfolio'] as const

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
          <div className="relative overflow-hidden rounded-[2.2rem] border border-slate-200/75 bg-white/52 p-6 shadow-[0_24px_72px_-44px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/60 dark:shadow-none sm:p-8">
            <div className="absolute -left-16 top-8 h-36 w-36 rounded-full bg-accent-500/10 blur-3xl dark:bg-accent-500/16" />
            <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/14" />
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/55 to-transparent dark:from-white/5" />

            <div className="relative grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-500 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/70 dark:text-accent-400 dark:shadow-none">
                  <Sparkles size={12} className="shrink-0" />
                  Explorar perfiles
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-text sm:text-3xl lg:text-[2.15rem]">
                  Busca un perfil publico y entende rapido que esta construyendo esa persona.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted">
                  Entra por username y accede a portfolio, CV, blog y roadmap publico desde una sola URL.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {['Portfolio', 'CV', 'Roadmap', 'Blog'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200/80 bg-white/68 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <form
                  onSubmit={handleSearch}
                  className="rounded-[1.65rem] border border-slate-200/80 bg-white/62 p-3 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-black/10 dark:shadow-none"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                        @
                      </span>
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="username"
                        className="h-12 w-full rounded-xl border border-slate-200/80 bg-white/78 pl-9 pr-4 text-sm text-text placeholder:text-muted outline-none transition-colors focus:border-accent-500 dark:border-white/10 dark:bg-surface/75"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!value.trim()}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 via-cyan-500 to-accent-600 px-5 text-sm font-semibold text-white shadow-[0_18px_32px_-20px_rgba(59,130,246,0.42)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_38px_-20px_rgba(59,130,246,0.48)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Search size={14} />
                      Buscar
                    </button>
                  </div>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>Prueba rapida:</span>
                  {QUICK_LINKS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => router.push(`/${item.replace('@', '')}`)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/68 px-3 py-1.5 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-text dark:border-white/10 dark:bg-white/5 dark:text-muted dark:hover:border-border-bright dark:hover:text-text"
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
