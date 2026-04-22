'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { TIMES_OF_DAY, TIME_OF_DAY_LABELS, TIME_OF_DAY_EMOJI } from '@/types/habits'
import type { Routine } from '@/types/habits'

export interface RoutineFormHandle {
  open(data?: Routine | null): void
  close(): void
}

interface RoutineFormProps {
  onSubmitCreate: (fd: FormData) => void
  onSubmitUpdate: (fd: FormData) => void
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-slate-400'

export const RoutineForm = forwardRef<RoutineFormHandle, RoutineFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<Routine | null>(null)
    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) { setEditData(data ?? null); dialogRef.current?.showModal() },
      close()    { dialogRef.current?.close() },
    }))

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      if (isEdit) onSubmitUpdate(fd)
      else onSubmitCreate(fd)
      dialogRef.current?.close()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-md rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{isEdit ? 'Editar rutina' : 'Nueva rutina'}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded p-1 text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {isEdit && <input type="hidden" name="id" value={editData.id} />}

          <div>
            <label className="mb-1 block text-xs font-medium">Nombre *</label>
            <input name="name" required maxLength={255} defaultValue={editData?.name ?? ''} placeholder="Ej: Morning Routine" className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Descripción</label>
            <textarea name="description" rows={2} defaultValue={editData?.description ?? ''} placeholder="Qué incluye esta rutina..." className={`${inputCls} resize-none`} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Momento del día</label>
              <select name="time_of_day" defaultValue={editData?.time_of_day ?? 'morning'} className={inputCls}>
                {TIMES_OF_DAY.map((t) => (
                  <option key={t} value={t}>
                    {TIME_OF_DAY_EMOJI[t]} {TIME_OF_DAY_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Duración estimada (min)</label>
              <input
                name="estimated_minutes"
                type="number"
                min="1"
                max="480"
                defaultValue={editData?.estimated_minutes ?? ''}
                placeholder="30"
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar' : 'Crear rutina'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)
RoutineForm.displayName = 'RoutineForm'
