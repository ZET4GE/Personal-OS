'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteAllReadAction } from '@/app/(dashboard)/notifications/actions'

export function DeleteAllReadButton() {
  const [pending, start] = useTransition()
  const router = useRouter()

  function handle() {
    start(async () => {
      await deleteAllReadAction()
      router.refresh()
    })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text/70 transition-colors hover:bg-surface-elevated disabled:opacity-50"
    >
      <Trash2 size={14} />
      Borrar leídas
    </button>
  )
}
