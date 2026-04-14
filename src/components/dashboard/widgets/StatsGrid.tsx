import { Briefcase, FolderOpen, Users, DollarSign } from 'lucide-react'
import type { DashboardStats } from '@/types/dashboard'
import type { LucideIcon } from 'lucide-react'

type IconColor = 'blue' | 'green' | 'amber' | 'purple'

const ICON_STYLES: Record<IconColor, { icon: string; bg: string; bar: string }> = {
  blue:   { icon: 'text-blue-500',    bg: 'bg-blue-500/10 dark:bg-blue-500/15',    bar: 'bg-blue-500'    },
  green:  { icon: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', bar: 'bg-emerald-500' },
  amber:  { icon: 'text-amber-500',   bg: 'bg-amber-500/10 dark:bg-amber-500/15',  bar: 'bg-amber-500'   },
  purple: { icon: 'text-violet-500',  bg: 'bg-violet-500/10 dark:bg-violet-500/15', bar: 'bg-violet-500'  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label:  string
  value:  string
  icon:   LucideIcon
  color:  IconColor
}) {
  const styles = ICON_STYLES[color]
  return (
    <div className="group relative overflow-hidden flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)]">
      {/* Colored top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-[3px] ${styles.bar} opacity-70`} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.bg}`}>
          <Icon size={15} className={styles.icon} />
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-text">{value}</p>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard label="Empleos Activos"      value={String(stats.interviews)}                     icon={Briefcase}   color="blue"   />
      <StatCard label="Proyectos en Progreso" value={String(stats.activeProjects)}                 icon={FolderOpen}  color="green"  />
      <StatCard label="Clientes Activos"      value={String(stats.activeClients)}                  icon={Users}       color="purple" />
      <StatCard label="Ingresos del Mes"      value={`$${stats.monthlyRevenue.toLocaleString()}`}  icon={DollarSign}  color="amber"  />
    </div>
  )
}
