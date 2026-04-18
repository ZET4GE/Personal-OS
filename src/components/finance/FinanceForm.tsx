'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  FINANCE_CURRENCIES,
  FINANCE_PAYMENT_METHOD_LABELS,
  FINANCE_PAYMENT_METHODS,
  FINANCE_TYPE_LABELS,
  FINANCE_TRANSACTION_TYPES,
} from '@/types/finance'
import type { FinanceCategory, FinanceTransaction } from '@/types/finance'

export interface FinanceFormHandle {
  open(initialData?: FinanceTransaction | null): void
  close(): void
}

interface FinanceFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
  categories: FinanceCategory[]
}

export const FinanceForm = forwardRef<FinanceFormHandle, FinanceFormProps>(
  ({ onSubmitCreate, onSubmitUpdate, categories }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<FinanceTransaction | null>(null)

    const isEdit = editData !== null
    const title = isEdit ? 'Editar movimiento' : 'Nuevo movimiento'

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        dialogRef.current?.showModal()
      },
      close() {
        dialogRef.current?.close()
      },
    }))

    function handleClose() {
      dialogRef.current?.close()
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)

      if (isEdit) {
        formData.set('id', editData.id)
        onSubmitUpdate(formData)
      } else {
        onSubmitCreate(formData)
      }

      handleClose()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo" htmlFor="type">
              <select id="type" name="type" defaultValue={editData?.type ?? 'expense'} className={inputCls}>
                {FINANCE_TRANSACTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FINANCE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Fecha" htmlFor="occurred_at">
              <input
                id="occurred_at"
                name="occurred_at"
                type="date"
                defaultValue={editData?.occurred_at ?? new Date().toISOString().slice(0, 10)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-[1fr_110px] gap-3">
            <Field label="Monto" htmlFor="amount">
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={editData?.amount ?? ''}
                placeholder="15000"
                className={inputCls}
              />
            </Field>

            <Field label="Moneda" htmlFor="currency">
              <select id="currency" name="currency" defaultValue={editData?.currency ?? 'ARS'} className={inputCls}>
                {FINANCE_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria" htmlFor="category">
              <input
                id="category"
                name="category"
                type="text"
                list="finance-categories"
                defaultValue={editData?.category ?? ''}
                placeholder="Comida, sueldo..."
                className={inputCls}
              />
              <datalist id="finance-categories">
                {categories.map((category) => (
                  <option key={category.id} value={category.name} />
                ))}
              </datalist>
            </Field>

            <Field label="Metodo" htmlFor="payment_method">
              <select
                id="payment_method"
                name="payment_method"
                defaultValue={editData?.payment_method ?? 'transfer'}
                className={inputCls}
              >
                {FINANCE_PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {FINANCE_PAYMENT_METHOD_LABELS[method]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Descripcion" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={editData?.description ?? ''}
              placeholder="Detalle del movimiento..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              name="is_recurring"
              type="checkbox"
              defaultChecked={editData?.is_recurring ?? false}
              className="h-4 w-4 rounded border-border"
            />
            Movimiento recurrente
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {isEdit ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

FinanceForm.displayName = 'FinanceForm'

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
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors ' +
  'focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 placeholder:text-muted'
