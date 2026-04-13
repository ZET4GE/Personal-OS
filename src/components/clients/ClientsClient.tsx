'use client'

import { useOptimistic, useTransition, useRef, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { createClientAction, updateClientAction, deleteClientAction } from '@/app/(dashboard)/clients/actions'
import { ClientCard } from './ClientCard'
import { ClientForm, type ClientFormHandle } from './ClientForm'
import type { Client } from '@/types/clients'

type OptClient = Client & { isOptimistic?: boolean }

function reducer(state: OptClient[], op: { type: 'add'; c: OptClient } | { type: 'delete'; id: string } | { type: 'update'; id: string; patch: Partial<Client> }): OptClient[] {
  if (op.type === 'add')    return [op.c, ...state]
  if (op.type === 'delete') return state.filter((c) => c.id !== op.id)
  if (op.type === 'update') return state.map((c) => c.id === op.id ? { ...c, ...op.patch } : c)
  return state
}

interface ClientsClientProps {
  clients: Client[]
}

export function ClientsClient({ clients }: ClientsClientProps) {
  const [optimistic, dispatch] = useOptimistic(clients, reducer)
  const [, startTransition]    = useTransition()
  const [search, setSearch]    = useState('')
  const formRef                = useRef<ClientFormHandle>(null)

  const filtered = search.trim()
    ? optimistic.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : optimistic

  function openCreate() { formRef.current?.open(null) }
  function openEdit(c: Client) { formRef.current?.open(c) }

  function handleCreate(fd: FormData) {
    const now = new Date().toISOString()
    const opt: OptClient = {
      id: `opt-${Date.now()}`, user_id: '',
      name: String(fd.get('name') ?? ''),
      email: (fd.get('email') as string) || null,
      company: (fd.get('company') as string) || null,
      phone: (fd.get('phone') as string) || null,
      notes: null, created_at: now, isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', c: opt })
      const r = await createClientAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Cliente creado')
    })
  }

  function handleUpdate(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'update', id, patch: { name: String(fd.get('name') ?? '') } })
      const r = await updateClientAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Cliente actualizado')
    })
  }

  function handleDelete(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const r = await deleteClientAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Cliente eliminado')
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, empresa o email..."
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 min-w-40"
        />
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Users size={24} className="text-muted" />
          </span>
          <p className="font-medium">{search ? 'Sin resultados' : 'Sin clientes todavía'}</p>
          {!search && <p className="mt-1 max-w-xs text-sm text-muted">Agrega tu primer cliente con el botón de arriba.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ClientForm ref={formRef} onSubmitCreate={handleCreate} onSubmitUpdate={handleUpdate} />
    </>
  )
}
