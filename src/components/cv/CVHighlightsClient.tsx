'use client'

import { useOptimistic, useRef, useTransition } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createCVHighlightAction, deleteCVHighlightAction, updateCVHighlightAction } from '@/app/(dashboard)/cv/actions'
import { CVHighlightForm, type CVHighlightFormHandle } from './CVHighlightForm'
import type { CVHighlight } from '@/types/cv'
import { Pencil, Trash2 } from 'lucide-react'

type OptimisticHighlight = CVHighlight & { isOptimistic?: boolean }

type Op =
  | { type: 'add';    item: OptimisticHighlight }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; patch: Partial<CVHighlight> }

function reducer(state: OptimisticHighlight[], op: Op): OptimisticHighlight[] {
  switch (op.type) {
    case 'add':    return [op.item, ...state]
    case 'delete': return state.filter((h) => h.id !== op.id)
    case 'update': return state.map((h) => h.id === op.id ? { ...h, ...op.patch } : h)
    default:       return state
  }
}

export function CVHighlightsClient({ items }: { items: CVHighlight[] }) {
  const [optimistic, dispatch] = useOptimistic<OptimisticHighlight[], Op>(
    items as OptimisticHighlight[],
    reducer,
  )
  const [, startTransition]    = useTransition()
  const formRef = useRef<CVHighlightFormHandle>(null)

  function handleCreate(formData: FormData) {
    const now = new Date().toISOString()
    const optimisticItem: OptimisticHighlight = {
      id:          `optimistic-${Date.now()}`,
      user_id:     '',
      icon:        (formData.get('icon') as string) || null,
      title:       String(formData.get('title') ?? ''),
      body:        (formData.get('body') as string) || null,
      order_index: 0,
      created_at:  now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticItem })
      const result = await createCVHighlightAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Destacado agregado')
    })
  }

  function handleUpdate(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    const patch: Partial<CVHighlight> = {
      icon:  (formData.get('icon') as string) || null,
      title: String(formData.get('title') ?? ''),
      body:  (formData.get('body') as string) || null,
    }
    startTransition(async () => {
      dispatch({ type: 'update', id, patch })
      const result = await updateCVHighlightAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Destacado actualizado')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteCVHighlightAction(formData)
      if (result.error) toast.error(result.error)
      else toast.success('Destacado eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{optimistic.length} {optimistic.length === 1 ? 'destacado' : 'destacados'}</p>
        <button
          onClick={() => formRef.current?.open(null)}
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {optimistic.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Sparkles size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin destacados todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Agregá logros clave, números o frases que resuman tu trayectoria. Se muestran en la parte superior de tu CV público.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {optimistic.map((item) => (
            <div
              key={item.id}
              className={[
                'group relative rounded-xl border bg-surface p-4 transition-shadow hover:shadow-sm',
                item.isOptimistic ? 'opacity-60' : '',
              ].join(' ')}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => formRef.current?.open(item)}
                  disabled={item.isOptimistic}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40"
                  aria-label="Editar"
                >
                  <Pencil size={13} />
                </button>
                <form
                  action={handleDelete}
                  onSubmit={(e) => { if (!confirm('Eliminar este destacado?')) e.preventDefault() }}
                >
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    disabled={item.isOptimistic}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>

              {item.icon && <p className="mb-2 text-2xl">{item.icon}</p>}
              <p className="pr-12 font-semibold leading-snug">{item.title}</p>
              {item.body && <p className="mt-1 text-sm text-muted leading-relaxed">{item.body}</p>}
            </div>
          ))}
        </div>
      )}

      <CVHighlightForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
