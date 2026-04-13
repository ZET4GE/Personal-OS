'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import type { WorkExperience } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Handle
// ─────────────────────────────────────────────────────────────

export interface ExperienceFormHandle {
  open(data?: WorkExperience | null): void
  close(): void
}

interface ExperienceFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const ExperienceForm = forwardRef<ExperienceFormHandle, ExperienceFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<WorkExperience | null>(null)
    const [isCurrent, setIsCurrent] = useState(false)

    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        setIsCurrent(data?.is_current ?? false)
        dialogRef.current?.showModal()
      },
      close() { dialogRef.current?.close() },
    }))

    function handleClose() { dialogRef.current?.close() }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      fd.set('is_current', String(isCurrent))
      if (isCurrent) fd.delete('end_date')

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
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold">
            {isEdit ? 'Editar experiencia' : 'Nueva experiencia'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-muted hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Empresa *" htmlFor="company">
              <input
                id="company" name="company" type="text" required
                defaultValue={editData?.company}
                placeholder="Acme Corp"
                className={inputCls}
              />
            </Field>
            <Field label="Rol / Cargo *" htmlFor="role">
              <input
                id="role" name="role" type="text" required
                defaultValue={editData?.role}
                placeholder="Frontend Engineer"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Location */}
          <Field label="Ubicación" htmlFor="location">
            <input
              id="location" name="location" type="text"
              defaultValue={editData?.location ?? ''}
              placeholder="Madrid, España · Remoto"
              className={inputCls}
            />
          </Field>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio *" htmlFor="start_date">
              <input
                id="start_date" name="start_date" type="date" required
                defaultValue={editData?.start_date?.slice(0, 10) ?? ''}
                className={inputCls}
              />
            </Field>
            <Field label="Fin" htmlFor="end_date">
              <input
                id="end_date" name="end_date" type="date"
                defaultValue={editData?.end_date?.slice(0, 10) ?? ''}
                disabled={isCurrent}
                className={inputCls + (isCurrent ? ' opacity-40 cursor-not-allowed' : '')}
              />
            </Field>
          </div>

          {/* Is current */}
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4 w-4 rounded accent-accent-600"
            />
            Trabajo aquí actualmente
          </label>

          {/* Description */}
          <Field label="Descripción" htmlFor="description">
            <textarea
              id="description" name="description" rows={4}
              defaultValue={editData?.description ?? ''}
              placeholder="Responsabilidades, logros, stack utilizado..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button" onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

ExperienceForm.displayName = 'ExperienceForm'

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

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
