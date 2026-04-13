'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { CVDocument, type CVDocumentProps } from './CVDocument'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface DownloadCVButtonProps extends CVDocumentProps {
  username: string
  /** Variante visual: 'outline' para la vista pública, 'solid' para el dashboard */
  variant?: 'outline' | 'solid'
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function DownloadCVButton({
  username,
  variant = 'outline',
  profile,
  experience,
  education,
  skills,
}: DownloadCVButtonProps) {
  const filename = `${username}-cv.pdf`

  const baseClass =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors'

  const variantClass =
    variant === 'solid'
      ? 'bg-accent-600 text-white hover:opacity-90'
      : 'border border-border hover:bg-slate-50 dark:hover:bg-slate-800'

  return (
    <PDFDownloadLink
      document={
        <CVDocument
          profile={profile}
          experience={experience}
          education={education}
          skills={skills}
        />
      }
      fileName={filename}
      className={`${baseClass} ${variantClass}`}
    >
      {({ loading }) => (
        <>
          <Download size={14} className={loading ? 'animate-pulse' : ''} />
          {loading ? 'Generando…' : 'Descargar PDF'}
        </>
      )}
    </PDFDownloadLink>
  )
}
