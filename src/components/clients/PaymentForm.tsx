'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'
import { X } from 'lucide-react'
import { CURRENCIES, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '@/types/clients'
import type { Currency } from '@/types/clients'

export interface PaymentFormHandle {
  open(): void
  close(): void
}

interface PaymentFormProps {
  projectId:       string
  defaultCurrency: Currency
  onSubmit:        (fd: FormData) => void
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-slate-400'

export const PaymentForm = forwardRef<PaymentFormHandle, PaymentFormProps>(
  ({ projectId, defaultCurrency, onSubmit }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const today     = new Date().toISOString().slice(0, 10)

    useImperativeHandle(ref, () => ({
      open()  { dialogRef.current?.showModal() },
      close() { dialogRef.current?.close() },
    }))

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      onSubmit(fd)
      dialogRef.current?.close()
      e.currentTarget.reset()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-sm rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Registrar pago</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded p-1 text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          <input type="hidden" name="project_id" value={projectId} />

          <div className="grid gap-3 grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Monto *</label>
              <input name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Divisa</label>
              <select name="currency" defaultValue={defaultCurrency} className={`${inputCls} cursor-pointer`}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Fecha</label>
              <input name="payment_date" type="date" defaultValue={today} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Método</label>
              <select name="method" className={`${inputCls} cursor-pointer`}>
                <option value="">Sin especificar</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Notas</label>
            <textarea name="notes" rows={2} placeholder="Detalle del pago..." className={`${inputCls} resize-none`} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              Registrar
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)
PaymentForm.displayName = 'PaymentForm'
