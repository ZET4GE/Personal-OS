import { PROJECT_STATUS_CLIENT_LABELS, PROJECT_STATUS_CLIENT_STYLES } from '@/types/clients'
import type { ProjectStatusClient } from '@/types/clients'

interface ProjectStatusBadgeProps {
  status: ProjectStatusClient
  className?: string
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        PROJECT_STATUS_CLIENT_STYLES[status],
        className,
      ].join(' ')}
    >
      {PROJECT_STATUS_CLIENT_LABELS[status]}
    </span>
  )
}
