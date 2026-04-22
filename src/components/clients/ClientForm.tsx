'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Client } from '@/types/clients'

export interface ClientFormHandle {
  open(data?: Client | null): void
  close(): void
}

interface ClientFormProps {
  onSubmitCreate: (fd: FormData) => void
  onSubmitUpdate: (fd: FormData) => void
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-slate-400'

export const ClientForm = forwardRef<ClientFormHandle, ClientFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<Client | null>(null)
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
            <h2 className="text-base font-semibold">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded p-1 text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {isEdit && <input type="hidden" name="id" value={editData.id} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium">Nombre *</label>
              <input name="name" required defaultValue={editData?.name ?? ''} placeholder="Nombre del cliente" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Empresa</label>
              <input name="company" defaultValue={editData?.company ?? ''} placeholder="Empresa S.A." className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Email</label>
              <input name="email" type="email" defaultValue={editData?.email ?? ''} placeholder="correo@ejemplo.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Teléfono</label>
              <input name="phone" defaultValue={editData?.phone ?? ''} placeholder="+54 9 11 1234-5678" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Notas</label>
            <textarea name="notes" rows={2} defaultValue={editData?.notes ?? ''} placeholder="Información adicional..." className={`${inputCls} resize-none`} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)
ClientForm.displayName = 'ClientForm'
