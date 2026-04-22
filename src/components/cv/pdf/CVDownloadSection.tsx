'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'
import type { CVDocumentProps } from './CVDocumentPro'

// El dynamic con ssr: false debe vivir en un Client Component
const DownloadCVButton = dynamic(
  () => import('./DownloadCVButton').then((m) => m.DownloadCVButton),
  {
    ssr: false,
    loading: () => <Skeleton className="h-8 w-36 rounded-lg" />,
  },
)

interface CVDownloadSectionProps extends CVDocumentProps {
  username: string
}

export function CVDownloadSection({
  username,
  profile,
  experience,
  education,
  skills,
  courses,
  projects,
}: CVDownloadSectionProps) {
  return (
    <div className="flex items-center gap-2">
      <DownloadCVButton
        username={username}
        variant="outline"
        profile={profile}
        experience={experience}
        education={education}
        skills={skills}
        courses={courses}
        projects={projects}
      />
      <a
        href={`/api/cv/${username}/pdf?format=visual&lang=es`}
        download
        className="hidden text-xs text-muted underline underline-offset-2 hover:text-foreground sm:inline"
      >
        Link directo
      </a>
    </div>
  )
}
