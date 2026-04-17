'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import type { CVProject } from '@/types/cv'

export interface CVProjectFormHandle {
  open(data?: CVProject | null): void
  close(): void
}

interface CVProjectFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

export const CVProjectForm = forwardRef<CVProjectFormHandle, CVProjectFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<CVProject | null>(null)
    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        dialogRef.current?.showModal()
      },
      close() { dialogRef.current?.close() },
    }))

    function handleClose() { dialogRef.current?.close() }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      if (isEdit) {
        fd.set('id', editData.id)
        onSubmitUpdate(fd)
      } else {
        onSubmitCreate(fd)
      }
      handleClose()
    }

    return (
      <dialog ref={dialogRef} className="m-auto w-full max-w-lg rounded-2xl border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto para CV'}</h2>
          <button type="button" onClick={handleClose} className="rounded p-1 text-muted transition-colors hover:text-foreground" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          <Field label="Proyecto *" htmlFor="title">
            <input id="title" name="title" type="text" required defaultValue={editData?.title ?? ''} placeholder="Landing SaaS / Portfolio / API" className={inputCls} />
          </Field>

          <Field label="Descripcion" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={editData?.description ?? ''} placeholder="Problema, solucion, rol y resultado." className={`${inputCls} resize-none`} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Demo" htmlFor="url">
              <input id="url" name="url" type="url" defaultValue={editData?.url ?? ''} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Repositorio" htmlFor="repo_url">
              <input id="repo_url" name="repo_url" type="url" defaultValue={editData?.repo_url ?? ''} placeholder="https://github.com/..." className={inputCls} />
            </Field>
          </div>

          <Field label="Tecnologias" htmlFor="tech_stack">
            <input id="tech_stack" name="tech_stack" type="text" defaultValue={editData?.tech_stack.join(', ') ?? ''} placeholder="Next.js, Supabase, Tailwind" className={inputCls} />
          </Field>

          <label className="flex items-start gap-3 rounded-lg border border-border px-3 py-2 text-sm">
            <input type="checkbox" name="is_featured" value="true" defaultChecked={editData?.is_featured ?? false} className="mt-0.5 h-4 w-4 rounded accent-accent-600" />
            <span>
              <span className="font-medium">Destacar en el CV</span>
              <span className="block text-xs text-muted">Aparece primero en la lista de proyectos.</span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={handleClose} className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800" style={{ borderColor: 'var(--color-border)' }}>
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

CVProjectForm.displayName = 'CVProjectForm'

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
