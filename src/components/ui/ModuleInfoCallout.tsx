'use client'

import { useEffect, useState } from 'react'
import { X, Info } from 'lucide-react'

interface ModuleInfoCalloutProps {
  storageKey: string
  title: string
  children: React.ReactNode
}

export function ModuleInfoCallout({ storageKey, title, children }: ModuleInfoCalloutProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(`winf_info_${storageKey}`)
      if (!dismissed) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [storageKey])

  function dismiss() {
    try {
      localStorage.setItem(`winf_info_${storageKey}`, '1')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
      <Info size={15} className="mt-0.5 shrink-0 text-blue-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-blue-300">{title}</p>
        <div className="mt-1 text-xs leading-5 text-muted">{children}</div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded p-0.5 text-muted transition-colors hover:text-text"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>
    </div>
  )
}
