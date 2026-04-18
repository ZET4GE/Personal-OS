'use client'

import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { ArrowLeft, ArrowRight, Check, HelpCircle, X } from 'lucide-react'
import { completeProductTourAction } from '@/app/(dashboard)/actions'

interface ProductTourProps {
  defaultOpen: boolean
}

const STEPS = [
  {
    title: 'WINF empieza por una meta activa',
    description:
      'Tu dashboard, roadmap, acciones de hoy y progreso se ordenan alrededor de la meta que elegiste.',
    actionLabel: 'Ver metas',
    actionHref: '/goals',
  },
  {
    title: 'Roadmap es el camino, no el objetivo',
    description:
      'Usalo para dividir una meta en pasos claros. Despues cada paso puede generar tareas, habitos o rutinas.',
    actionLabel: 'Abrir roadmaps',
    actionHref: '/roadmaps',
  },
  {
    title: 'Acciones de hoy',
    description:
      'Cada dia deberias tener una accion concreta: avanzar un proyecto, completar un habito, seguir una rutina o registrar tiempo.',
    actionLabel: 'Ir al dashboard',
    actionHref: '/dashboard',
  },
  {
    title: 'Timer y progreso real',
    description:
      'Cuando termines una sesion, asigna el tiempo a una meta o proyecto para que WINF mida avance real.',
    actionLabel: 'Ver tiempo',
    actionHref: '/time',
  },
  {
    title: 'Configura solo lo que uses',
    description:
      'Si algo no te sirve, ocultalo desde preferencias. WINF debe sentirse como una guia, no como un panel infinito.',
    actionLabel: 'Preferencias',
    actionHref: '/settings/preferences',
  },
]

function removeTourParam() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('tour')) return
  url.searchParams.delete('tour')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export function ProductTour({ defaultOpen }: ProductTourProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (defaultOpen || params.get('tour') === '1') setOpen(true)
  }, [defaultOpen])

  function finish() {
    startTransition(async () => {
      await completeProductTourAction()
      removeTourParam()
      setOpen(false)
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-600/15 text-accent-400">
              <HelpCircle size={17} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">
                Guia inicial
              </p>
              <p className="text-xs text-muted">
                Paso {step + 1} de {STEPS.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            disabled={isPending}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
            aria-label="Cerrar guia"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-7">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent-500 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-text">{current.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{current.description}</p>
          </div>

          <Link
            href={current.actionHref}
            className="inline-flex rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-border-bright hover:bg-surface-hover"
          >
            {current.actionLabel}
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition hover:border-border-bright hover:text-text disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            Atras
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? 'Guardando...' : 'Entendido'}
              <Check size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Siguiente
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
