'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import type { CVCourse } from '@/types/cv'

export interface CVCourseFormHandle {
  open(data?: CVCourse | null): void
  close(): void
}

interface CVCourseFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

export const CVCourseForm = forwardRef<CVCourseFormHandle, CVCourseFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<CVCourse | null>(null)
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
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-lg rounded-2xl border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-semibold">{isEdit ? 'Editar curso' : 'Nuevo curso'}</h2>
          <button type="button" onClick={handleClose} className="rounded p-1 text-muted transition-colors hover:text-foreground" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          <Field label="Curso *" htmlFor="title">
            <input id="title" name="title" type="text" required defaultValue={editData?.title ?? ''} placeholder="AWS Cloud Practitioner" className={inputCls} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Institucion" htmlFor="provider">
              <input id="provider" name="provider" type="text" defaultValue={editData?.provider ?? ''} placeholder="AWS, Coursera, Udemy" className={inputCls} />
            </Field>
            <Field label="Finalizado" htmlFor="completed_at">
              <input id="completed_at" name="completed_at" type="date" defaultValue={editData?.completed_at?.slice(0, 10) ?? ''} className={inputCls} />
            </Field>
          </div>

          <Field label="Credencial" htmlFor="credential_url">
            <input id="credential_url" name="credential_url" type="url" defaultValue={editData?.credential_url ?? ''} placeholder="https://..." className={inputCls} />
          </Field>

          <Field label="Descripcion" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={editData?.description ?? ''} placeholder="Que aprendiste, proyecto final, certificacion..." className={`${inputCls} resize-none`} />
          </Field>

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

CVCourseForm.displayName = 'CVCourseForm'

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
