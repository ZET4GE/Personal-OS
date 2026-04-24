'use client'

import { useTransition } from 'react'
import { CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { markAllAsReadAction } from '@/app/(dashboard)/notifications/actions'

export function MarkAllReadButton() {
  const [pending, start] = useTransition()
  const router = useRouter()

  function handle() {
    start(async () => {
      await markAllAsReadAction()
      router.refresh()
    })
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text/70 transition-colors hover:bg-surface-elevated disabled:opacity-50"
    >
      <CheckCheck size={14} />
      Leer todo
    </button>
  )
}
