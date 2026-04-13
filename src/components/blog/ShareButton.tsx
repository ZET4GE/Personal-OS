'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      {copied ? (
        <>
          <Check size={13} className="text-green-500" />
          <span className="text-green-600 dark:text-green-400">¡Copiado!</span>
        </>
      ) : (
        <>
          <Share2 size={13} />
          Compartir
        </>
      )}
    </button>
  )
}
