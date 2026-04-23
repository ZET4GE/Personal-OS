'use client'

import { useState } from 'react'
import { Download, Eye, FileText, Lock } from 'lucide-react'
import { CVPreviewATS } from '@/components/cv/CVPreviewATS'
import type { Profile } from '@/types/profile'
import type { CVCourse, CVProject, Education, Skill, WorkExperience } from '@/types/cv'

interface CVExportPanelProps {
  username: string
  canUseAts: boolean
  profile: Profile
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  courses: CVCourse[]
  projects: CVProject[]
}

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
] as const

function ExportLink({
  href,
  label,
  disabled,
}: {
  href: string
  label: string
  disabled?: boolean
}) {
  const className =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors'

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-55`} title="Disponible en Pro">
        <Lock size={13} />
        {label}
      </span>
    )
  }

  return (
    <a href={href} download className={`${className} hover:bg-slate-50 dark:hover:bg-slate-800`}>
      <Download size={13} />
      {label}
    </a>
  )
}

export function CVExportPanel({
  username,
  canUseAts,
  profile,
  experience,
  education,
  skills,
  courses,
  projects,
}: CVExportPanelProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted" />
              <h3 className="text-sm font-semibold">Exportar CV</h3>
            </div>
            <p className="mt-1 text-xs text-muted">
              Visual para compartir. ATS simple para sistemas de seleccion.
            </p>
          </div>
          {!canUseAts && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
              ATS Pro
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-muted">CV visual</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <ExportLink
                  key={language.code}
                  href={`/api/cv/${username}/pdf?format=visual&lang=${language.code}`}
                  label={`PDF ${language.label}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted">CV ATS</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <ExportLink
                  key={language.code}
                  href={`/api/cv/${username}/pdf?format=ats&lang=${language.code}`}
                  label={`ATS ${language.label}`}
                  disabled={!canUseAts}
                />
              ))}
              {canUseAts && (
                <button
                  type="button"
                  onClick={() => setShowPreview((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Eye size={13} />
                  {showPreview ? 'Ocultar preview' : 'Ver preview ATS'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!canUseAts && (
          <p className="mt-3 text-xs text-muted">
            Preview ATS disponible en Pro.
          </p>
        )}
      </div>

      {canUseAts && showPreview && (
        <CVPreviewATS
          profile={profile}
          experience={experience}
          education={education}
          skills={skills}
          courses={courses}
          projects={projects}
        />
      )}
    </div>
  )
}
