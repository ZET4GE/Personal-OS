'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import type { CVHighlight } from '@/types/cv'

export interface CVHighlightFormHandle {
  open(data?: CVHighlight | null): void
  close(): void
}

interface CVHighlightFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

const EMOJI_SUGGESTIONS = ['⚡', '🚀', '🛠️', '💡', '🎯', '📦', '🔧', '🌐', '📈', '🤝', '🏆', '✅']

export const CVHighlightForm = forwardRef<CVHighlightFormHandle, CVHighlightFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<CVHighlight | null>(null)
    const [icon, setIcon] = useState('')
    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        setIcon(data?.icon ?? '')
        dialogRef.current?.showModal()
      },
      close() { dialogRef.current?.close() },
    }))

    function handleClose() { dialogRef.current?.close() }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      fd.set('icon', icon)
      if (isEdit) {
        fd.set('id', editData.id)
        onSubmitUpdate(fd)
      } else {
        onSubmitCreate(fd)
      }
      handleClose()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-2xl border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold">{isEdit ? 'Editar destacado' : 'Nuevo destacado'}</h2>
          <button type="button" onClick={handleClose} className="rounded p-1 text-muted transition-colors hover:text-foreground" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted">Ícono (emoji o texto)</label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(icon === e ? '' : e)}
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-colors',
                    icon === e ? 'border-accent-500 bg-accent-500/10' : 'border-border hover:border-border-bright',
                  ].join(' ')}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="o pegá cualquier emoji aquí"
              maxLength={4}
              className={inputCls}
            />
          </div>

          <Field label="Título *" htmlFor="title">
            <input
              id="title" name="title" type="text" required
              defaultValue={editData?.title ?? ''}
              placeholder="5 proyectos entregados, 3 años en producto..."
              className={inputCls}
            />
          </Field>

          <Field label="Descripción" htmlFor="body">
            <textarea
              id="body" name="body" rows={2}
              defaultValue={editData?.body ?? ''}
              placeholder="Detalle breve opcional..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button" onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

CVHighlightForm.displayName = 'CVHighlightForm'

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ' +
  'dark:bg-slate-900 placeholder:text-slate-400'
