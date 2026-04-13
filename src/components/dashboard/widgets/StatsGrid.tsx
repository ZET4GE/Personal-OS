import { Briefcase, FolderOpen, Users, DollarSign } from 'lucide-react'
import type { DashboardStats } from '@/types/dashboard'
import type { LucideIcon } from 'lucide-react'

type IconColor = 'blue' | 'green' | 'amber' | 'purple'

const ICON_COLORS: Record<IconColor, { bg: string; text: string }> = {
  blue:   { bg: 'bg-blue-500/10   dark:bg-blue-500/15',   text: 'text-blue-600   dark:text-blue-400'   },
  green:  { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  amber:  { bg: 'bg-amber-500/10  dark:bg-amber-500/15',  text: 'text-amber-600  dark:text-amber-400'  },
  purple: { bg: 'bg-violet-500/10 dark:bg-violet-500/15', text: 'text-violet-600 dark:text-violet-400' },
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
  const { bg, text } = ICON_COLORS[color]
  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-bright hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
          <Icon size={15} className={text} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        label="Empleos Activos"
        value={String(stats.interviews)}
        icon={Briefcase}
        color="blue"
      />
      <StatCard
        label="Proyectos en Progreso"
        value={String(stats.activeProjects)}
        icon={FolderOpen}
        color="green"
      />
      <StatCard
        label="Clientes Activos"
        value={String(stats.activeClients)}
        icon={Users}
        color="purple"
      />
      <StatCard
        label="Ingresos del Mes"
        value={`$${stats.monthlyRevenue.toLocaleString()}`}
        icon={DollarSign}
        color="amber"
      />
    </div>
  )
}
