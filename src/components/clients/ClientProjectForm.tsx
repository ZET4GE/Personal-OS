'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { PROJECT_STATUSES_CLIENT, PROJECT_STATUS_CLIENT_LABELS, PRIORITIES, PRIORITY_LABELS, CURRENCIES } from '@/types/clients'
import type { ClientProject, Client } from '@/types/clients'

export interface ClientProjectFormHandle {
  open(data?: ClientProject | null): void
  close(): void
}

interface ClientProjectFormProps {
  clients:        Client[]
  onSubmitCreate: (fd: FormData) => void
  onSubmitUpdate: (fd: FormData) => void
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-slate-400'

const selectCls = `${inputCls} cursor-pointer`

export const ClientProjectForm = forwardRef<ClientProjectFormHandle, ClientProjectFormProps>(
  ({ clients, onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<ClientProject | null>(null)
    const isEdit = editData !== null

    useImperativeHandle(ref, () => ({
      open(data) { setEditData(data ?? null); dialogRef.current?.showModal() },
      close()    { dialogRef.current?.close() },
    }))

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      isEdit ? onSubmitUpdate(fd) : onSubmitCreate(fd)
      dialogRef.current?.close()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-lg rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded p-1 text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          {isEdit && <input type="hidden" name="id" value={editData.id} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium">Título *</label>
              <input name="title" required defaultValue={editData?.title ?? ''} placeholder="Nombre del proyecto" className={inputCls} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Cliente</label>
              <select name="client_id" defaultValue={editData?.client_id ?? ''} className={selectCls}>
                <option value="">Sin cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Estado</label>
              <select name="status" defaultValue={editData?.status ?? 'proposal'} className={selectCls}>
                {PROJECT_STATUSES_CLIENT.map((s) => (
                  <option key={s} value={s}>{PROJECT_STATUS_CLIENT_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Prioridad</label>
              <select name="priority" defaultValue={editData?.priority ?? 'medium'} className={selectCls}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Divisa</label>
              <select name="currency" defaultValue={editData?.currency ?? 'ARS'} className={selectCls}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Presupuesto</label>
              <input name="budget" type="number" step="0.01" min="0" defaultValue={editData?.budget ?? ''} placeholder="0.00" className={inputCls} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Fecha inicio</label>
              <input name="start_date" type="date" defaultValue={editData?.start_date ?? ''} className={inputCls} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">Fecha entrega</label>
              <input name="due_date" type="date" defaultValue={editData?.due_date ?? ''} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Descripción</label>
            <textarea name="description" rows={2} defaultValue={editData?.description ?? ''} placeholder="Detalles del proyecto..." className={`${inputCls} resize-none`} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              {isEdit ? 'Guardar' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)
ClientProjectForm.displayName = 'ClientProjectForm'
