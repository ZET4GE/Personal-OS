import Link from 'next/link'
import { CalendarClock, AlertCircle } from 'lucide-react'
import type { DeadlineItem } from '@/types/dashboard'

export function UpcomingDeadlines({ deadlines }: { deadlines: DeadlineItem[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-semibold text-text">Próximos Vencimientos</h3>

      {deadlines.length > 0 ? (
        <div className="flex flex-col gap-3">
          {deadlines.map((item) => {
            const isUrgent = item.daysLeft < 3
            return (
              <Link
                key={item.id}
                href={`/projects/client`}
                className="group flex flex-col gap-1.5 rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:border-border-bright"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text group-hover:text-accent-500 transition-colors">
                    {item.title}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${isUrgent ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {isUrgent && <AlertCircle size={10} />}
                    {item.daysLeft === 0 ? 'Hoy' : `En ${item.daysLeft} día${item.daysLeft === 1 ? '' : 's'}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted">
                  <CalendarClock size={12} />
                  <span>{new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(item.dueDate))}</span>
                  {item.clientName && (
                    <>
                      <span>•</span>
                      <span>{item.clientName}</span>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-muted">Sin fechas límite próximas ✨</p>
        </div>
      )}
    </div>
  )
}