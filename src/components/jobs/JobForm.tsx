'use client'

import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { X } from 'lucide-react'
import { JOB_PRIORITIES, JOB_PRIORITY_LABELS, JOB_STATUS_LABELS, JOB_STATUSES } from '@/types/jobs'
import type { JobApplication } from '@/types/jobs'

// ─────────────────────────────────────────────────────────────
// Handle expuesto al padre via ref
// ─────────────────────────────────────────────────────────────

export interface JobFormHandle {
  open(initialData?: JobApplication | null): void
  close(): void
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface JobFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export const JobForm = forwardRef<JobFormHandle, JobFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<JobApplication | null>(null)
    const [error, setError] = useState<string | null>(null)

    const isEdit = editData !== null
    const title = isEdit ? 'Editar postulación' : 'Nueva postulación'

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        setError(null)
        dialogRef.current?.showModal()
      },
      close() {
        dialogRef.current?.close()
      },
    }))

    function handleClose() {
      dialogRef.current?.close()
      setError(null)
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      setError(null)

      if (isEdit) {
        fd.set('id', editData.id)
        onSubmitUpdate(fd)
      } else {
        onSubmitCreate(fd)
      }

      handleClose()
    }

    // Valor por defecto para applied_at (YYYY-MM-DD)
    const defaultDate = editData
      ? editData.applied_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10)

    const defaultFollowUp = toDateTimeLocal(editData?.next_follow_up_at)

    return (
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        style={{ borderColor: 'var(--color-border)' }}
        onClose={() => setError(null)}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold">{title}</h2>
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
          {/* Company */}
          <Field label="Empresa *" htmlFor="company">
            <input
              id="company"
              name="company"
              type="text"
              required
              defaultValue={editData?.company}
              placeholder="Acme Corp"
              className={inputCls}
            />
          </Field>

          {/* Role */}
          <Field label="Rol *" htmlFor="role">
            <input
              id="role"
              name="role"
              type="text"
              required
              defaultValue={editData?.role}
              placeholder="Frontend Engineer"
              className={inputCls}
            />
          </Field>

          {/* Status + Date (fila) */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado" htmlFor="status">
              <select
                id="status"
                name="status"
                defaultValue={editData?.status ?? 'applied'}
                className={inputCls}
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {JOB_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fecha" htmlFor="applied_at">
              <input
                id="applied_at"
                name="applied_at"
                type="date"
                defaultValue={defaultDate}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioridad" htmlFor="priority">
              <select
                id="priority"
                name="priority"
                defaultValue={editData?.priority ?? 'medium'}
                className={inputCls}
              >
                {JOB_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {JOB_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Proximo seguimiento" htmlFor="next_follow_up_at">
              <input
                id="next_follow_up_at"
                name="next_follow_up_at"
                type="datetime-local"
                defaultValue={defaultFollowUp}
                className={inputCls}
              />
            </Field>
          </div>

          {/* Link */}
          <Field label="Enlace a la oferta" htmlFor="link">
            <input
              id="link"
              name="link"
              type="url"
              defaultValue={editData?.link ?? ''}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fuente" htmlFor="source">
              <input
                id="source"
                name="source"
                type="text"
                defaultValue={editData?.source ?? ''}
                placeholder="LinkedIn, referido..."
                className={inputCls}
              />
            </Field>

            <Field label="Rango salarial" htmlFor="salary_range">
              <input
                id="salary_range"
                name="salary_range"
                type="text"
                defaultValue={editData?.salary_range ?? ''}
                placeholder="USD 2k - 3k"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notas" htmlFor="notes">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={editData?.notes ?? ''}
              placeholder="Reclutadora: Ana García, stack: React + Go..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
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

JobForm.displayName = 'JobForm'

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ' +
  'dark:bg-slate-900 placeholder:text-slate-400'

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}
