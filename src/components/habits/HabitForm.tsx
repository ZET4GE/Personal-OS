'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { FREQUENCIES, FREQUENCY_LABELS, HABIT_COLORS, HABIT_COLOR_STYLES } from '@/types/habits'
import type { Habit } from '@/types/habits'

export interface HabitFormHandle {
  open(data?: Habit | null): void
  close(): void
}

interface HabitFormProps {
  onSubmitCreate: (fd: FormData) => void
  onSubmitUpdate: (fd: FormData) => void
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-slate-400'

const DAYS = [
  { label: 'D', value: 0 },
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
]

export const HabitForm = forwardRef<HabitFormHandle, HabitFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef  = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<Habit | null>(null)
    const [color,    setColor]    = useState<string>('blue')
    const [freq,     setFreq]     = useState<string>('daily')
    const [selDays,  setSelDays]  = useState<number[]>([1, 2, 3, 4, 5, 6, 0])
    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        setColor(data?.color ?? 'blue')
        setFreq(data?.frequency ?? 'daily')
        setSelDays(data?.target_days ?? [1, 2, 3, 4, 5, 6, 0])
        dialogRef.current?.showModal()
      },
      close() { dialogRef.current?.close() },
    }))

    function toggleDay(d: number) {
      setSelDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      // target_days as comma-separated
      fd.set('target_days', selDays.join(','))
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
            <h2 className="text-base font-semibold">{isEdit ? 'Editar hábito' : 'Nuevo hábito'}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded p-1 text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {isEdit && <input type="hidden" name="id" value={editData.id} />}

          {/* Name + icon */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium">Nombre *</label>
              <input name="name" required maxLength={255} defaultValue={editData?.name ?? ''} placeholder="Ej: Meditar 10 min" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Icono</label>
              <input name="icon" maxLength={10} defaultValue={editData?.icon ?? ''} placeholder="🧘" className={inputCls + ' text-center text-lg'} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium">Descripción</label>
            <textarea name="description" rows={2} maxLength={500} defaultValue={editData?.description ?? ''} placeholder="Detalles opcionales..." className={`${inputCls} resize-none`} />
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-xs font-medium">Color</label>
            <input type="hidden" name="color" value={color} />
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={[
                    'h-7 w-7 rounded-full transition-all',
                    HABIT_COLOR_STYLES[c].bg,
                    color === c ? 'ring-2 ring-offset-2 ' + HABIT_COLOR_STYLES[c].ring : 'opacity-60 hover:opacity-100',
                  ].join(' ')}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-1 block text-xs font-medium">Frecuencia</label>
            <select
              name="frequency"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              className={inputCls}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>{FREQUENCY_LABELS[f]}</option>
              ))}
            </select>
          </div>

          {/* Target days (only for weekly) */}
          {freq === 'weekly' && (
            <div>
              <label className="mb-2 block text-xs font-medium">Días objetivo</label>
              <div className="flex gap-1.5">
                {DAYS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={[
                      'h-8 w-8 rounded-lg text-xs font-semibold transition-colors',
                      selDays.includes(d.value)
                        ? 'bg-accent-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar' : 'Crear hábito'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)
HabitForm.displayName = 'HabitForm'
