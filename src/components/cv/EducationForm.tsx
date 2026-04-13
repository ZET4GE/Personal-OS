'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Education } from '@/types/cv'

export interface EducationFormHandle {
  open(data?: Education | null): void
  close(): void
}

interface EducationFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

export const EducationForm = forwardRef<EducationFormHandle, EducationFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<Education | null>(null)

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
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold">
            {isEdit ? 'Editar educación' : 'Nueva educación'}
          </h2>
          <button type="button" onClick={handleClose}
            className="rounded p-1 text-muted hover:text-foreground transition-colors" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Institution */}
          <Field label="Institución *" htmlFor="institution">
            <input id="institution" name="institution" type="text" required
              defaultValue={editData?.institution}
              placeholder="Universidad Complutense de Madrid"
              className={inputCls} />
          </Field>

          {/* Degree + Field */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Título *" htmlFor="degree">
              <input id="degree" name="degree" type="text" required
                defaultValue={editData?.degree}
                placeholder="Grado / Máster / Bootcamp"
                className={inputCls} />
            </Field>
            <Field label="Área" htmlFor="field">
              <input id="field" name="field" type="text"
                defaultValue={editData?.field ?? ''}
                placeholder="Ingeniería Informática"
                className={inputCls} />
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio" htmlFor="start_date">
              <input id="start_date" name="start_date" type="date"
                defaultValue={editData?.start_date?.slice(0, 10) ?? ''}
                className={inputCls} />
            </Field>
            <Field label="Fin" htmlFor="end_date">
              <input id="end_date" name="end_date" type="date"
                defaultValue={editData?.end_date?.slice(0, 10) ?? ''}
                className={inputCls} />
            </Field>
          </div>

          {/* Description */}
          <Field label="Descripción" htmlFor="description">
            <textarea id="description" name="description" rows={3}
              defaultValue={editData?.description ?? ''}
              placeholder="Proyectos destacados, especialización..."
              className={`${inputCls} resize-none`} />
          </Field>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--color-border)' }}>
              Cancelar
            </button>
            <button type="submit"
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

EducationForm.displayName = 'EducationForm'

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
