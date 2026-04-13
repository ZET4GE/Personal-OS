'use client'

import Link from 'next/link'
import { Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react'
import type { Client } from '@/types/clients'

interface ClientCardProps {
  client:   Client & { isOptimistic?: boolean }
  onEdit:   (c: Client) => void
  onDelete: (fd: FormData) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <article
      className={[
        'group relative flex items-center gap-4 rounded-xl border bg-surface p-4 transition-shadow hover:shadow-sm',
        client.isOptimistic ? 'opacity-60' : '',
      ].join(' ')}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Avatar */}
      <Link href={`/clients/${client.id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
        {client.name[0]?.toUpperCase()}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/clients/${client.id}`} className="font-semibold hover:text-accent-600 transition-colors">
          {client.name}
        </Link>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          {client.company && (
            <span className="flex items-center gap-1">
              <Building2 size={11} /> {client.company}
            </span>
          )}
          {client.email && (
            <span className="flex items-center gap-1">
              <Mail size={11} /> {client.email}
            </span>
          )}
          {client.phone && (
            <span className="flex items-center gap-1">
              <Phone size={11} /> {client.phone}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(client)}
          disabled={client.isOptimistic}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-40"
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
        <form
          action={onDelete}
          onSubmit={(e) => { if (!confirm('¿Eliminar este cliente y sus proyectos?')) e.preventDefault() }}
        >
          <input type="hidden" name="id" value={client.id} />
          <button type="submit" disabled={client.isOptimistic} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-40" aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </form>
      </div>
    </article>
  )
}
