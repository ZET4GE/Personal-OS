import Link from 'next/link'
import { CheckCircle2, Briefcase, FolderOpen, Calendar, CircleDashed } from 'lucide-react'
import type { ActivityItem, ActivityType } from '@/types/dashboard'
import type { LucideIcon } from 'lucide-react'

const ACTIVITY_CONFIG: Record<ActivityType, { icon: LucideIcon; color: string; bg: string }> = {
  job_applied: { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  job_interview: { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  job_offer: { icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  project_created: { icon: FolderOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  project_completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  client_project_created: { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  habit_completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
}

function formatRelativeTime(dateString: string): string {
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Hace un momento'
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`
  const days = Math.floor(diffInSeconds / 86400)
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

export function RecentActivity({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-semibold text-text">Actividad Reciente</h3>
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-muted">Aún no hay actividad reciente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-semibold text-text">Actividad Reciente</h3>
      
      <div className="relative pl-3">
        {/* Línea vertical */}
        <div className="absolute bottom-4 left-5 top-4 w-px bg-border"></div>
        
        <div className="flex flex-col gap-5">
          {activity.map((item, index) => {
            const config = ACTIVITY_CONFIG[item.type] || { icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-500/10' }
            const Icon = config.icon

            return (
              <div key={item.id} className="relative flex gap-4">
                <div className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
                  <Icon size={12} />
                </div>
                
                <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
                  <p className="text-sm text-text">
                    <span className="font-medium">{item.label}</span>
                    {item.sub && <span className="text-muted"> — {item.sub}</span>}
                  </p>
                  <p className="text-xs text-muted">{formatRelativeTime(item.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}