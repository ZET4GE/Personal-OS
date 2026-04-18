'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { ArrowLeft, ArrowRight, Check, MousePointer2, X } from 'lucide-react'
import { completeProductTourAction } from '@/app/(dashboard)/actions'

interface GuidedProductTourProps {
  defaultOpen: boolean
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

const CARD_WIDTH = 340
const CARD_HEIGHT = 300
const GAP = 14

const STEPS = [
  {
    target: '[data-tour="nav-goals"]',
    title: 'Empeza por Metas',
    description:
      'Este es el centro de WINF. Aca creas o elegis la meta activa que ordena todo lo demas.',
    actionLabel: 'Abrir metas',
    actionHref: '/goals',
  },
  {
    target: '[data-tour="nav-roadmaps"]',
    title: 'Converti la meta en camino',
    description:
      'Roadmaps sirve para partir una meta grande en pasos. No es otra app: es el mapa para avanzar.',
    actionLabel: 'Abrir roadmaps',
    actionHref: '/roadmaps',
  },
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Volves al dashboard para ejecutar',
    description:
      'El dashboard deberia responder una pregunta: que tengo que hacer hoy para avanzar mi meta?',
    actionLabel: 'Ir al dashboard',
    actionHref: '/dashboard',
  },
  {
    target: '[data-tour="timer"]',
    title: 'Registra tiempo real',
    description:
      'Cuando trabajes, abri el timer. Al detenerlo, asigna la sesion a una meta o proyecto.',
    actionLabel: 'Ver tiempo',
    actionHref: '/time',
  },
  {
    target: '[data-tour="global-search"]',
    title: 'Busca cualquier cosa',
    description:
      'El buscador encuentra metas, proyectos, notas, roadmaps, empleos, clientes y finanzas.',
    actionLabel: 'Abrir buscador',
    actionHref: '/search',
  },
  {
    target: '[data-tour="nav-settings"]',
    title: 'Oculta lo que no uses',
    description:
      'Desde preferencias podes activar o desactivar modulos. WINF debe adaptarse a tu forma de trabajar.',
    actionLabel: 'Preferencias',
    actionHref: '/settings/preferences',
  },
  {
    target: '[data-tour="nav-help"]',
    title: 'Ayuda queda siempre disponible',
    description:
      'Si te perdes, volve a Ayuda. Ahi podes repetir esta guia y ver el flujo recomendado.',
    actionLabel: 'Abrir ayuda',
    actionHref: '/help',
  },
]

function removeTourParam() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('tour')) return
  url.searchParams.delete('tour')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function getRect(target: string): Rect | null {
  const element = document.querySelector<HTMLElement>(target)
  if (!element || element.offsetParent === null) return null

  const rect = element.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function getCardStyle(rect: Rect | null): CSSProperties {
  if (!rect) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: CARD_WIDTH,
      maxHeight: CARD_HEIGHT,
    }
  }

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const canUseRight = rect.left + rect.width + CARD_WIDTH + GAP < viewportWidth
  const canUseLeft = rect.left - CARD_WIDTH - GAP > 12
  const top = Math.min(Math.max(12, rect.top), viewportHeight - CARD_HEIGHT - 12)

  if (canUseRight) {
    return { top, left: rect.left + rect.width + GAP, width: CARD_WIDTH, maxHeight: CARD_HEIGHT }
  }

  if (canUseLeft) {
    return { top, left: rect.left - CARD_WIDTH - GAP, width: CARD_WIDTH, maxHeight: CARD_HEIGHT }
  }

  return {
    top: Math.min(Math.max(12, rect.top + rect.height + GAP), viewportHeight - CARD_HEIGHT - 12),
    left: Math.min(Math.max(12, rect.left), viewportWidth - CARD_WIDTH - 12),
    width: CARD_WIDTH,
    maxHeight: CARD_HEIGHT,
  }
}

export function GuidedProductTour({ defaultOpen }: GuidedProductTourProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [isPending, startTransition] = useTransition()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const updatePosition = useCallback(() => {
    const nextRect = getRect(current.target)
    setRect(nextRect)

    if (nextRect) {
      document.querySelector<HTMLElement>(current.target)?.scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
      })
    }
  }, [current.target])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (defaultOpen || params.get('tour') === '1') setOpen(true)
  }, [defaultOpen])

  useEffect(() => {
    if (!open) return

    updatePosition()
    const id = window.setTimeout(updatePosition, 120)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, step, updatePosition])

  const cardStyle = useMemo(() => getCardStyle(rect), [rect])

  function finish() {
    startTransition(async () => {
      await completeProductTourAction()
      removeTourParam()
      setOpen(false)
    })
  }

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

      {rect ? (
        <div
          className="absolute rounded-xl border-2 border-accent-400 bg-accent-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.35),0_0_40px_rgba(59,130,246,0.35)] transition-all duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      ) : null}

      <section
        style={cardStyle}
        className="pointer-events-auto fixed flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-600/15 text-accent-400">
              <MousePointer2 size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-400">
                Guia inicial
              </p>
              <p className="text-[11px] text-muted">
                Paso {step + 1} de {STEPS.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={finish}
            disabled={isPending}
            className="rounded-lg p-1.5 text-muted transition hover:bg-surface-hover hover:text-text disabled:opacity-50"
            aria-label="Cerrar guia"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent-500 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-text">{current.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{current.description}</p>
          </div>

          <Link
            href={current.actionHref}
            onClick={() => window.setTimeout(updatePosition, 180)}
            className="inline-flex rounded-xl border border-border px-3 py-2 text-sm font-medium text-text transition hover:border-border-bright hover:bg-surface-hover"
          >
            {current.actionLabel}
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted transition hover:border-border-bright hover:text-text disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            Atras
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? 'Guardando...' : 'Finalizar'}
              <Check size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
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
