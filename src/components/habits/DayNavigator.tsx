'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_FULL  = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTH_ABR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDay(dateStr: string): string {
  const d   = new Date(dateStr + 'T12:00:00')
  const dow = DAY_FULL[d.getDay()]
  return `${dow.charAt(0).toUpperCase()}${dow.slice(1)}, ${d.getDate()} ${MONTH_ABR[d.getMonth()]}`
}

interface DayNavigatorProps {
  date:    string   // 'YYYY-MM-DD'
  basePath?: string // defaults to '/habits'
}

export function DayNavigator({ date, basePath = '/habits' }: DayNavigatorProps) {
  const router  = useRouter()
  const today   = new Date().toISOString().slice(0, 10)
  const isToday = date === today

  function go(offset: number) {
    const d = new Date(date + 'T12:00:00')
    d.setDate(d.getDate() + offset)
    const newDate = d.toISOString().slice(0, 10)
    if (newDate > today) return
    router.push(newDate === today ? basePath : `${basePath}?date=${newDate}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(-1)}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
        aria-label="Día anterior"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="min-w-[160px] text-center">
        <p className="text-sm font-semibold">{formatDay(date)}</p>
        {!isToday && (
          <button
            onClick={() => router.push(basePath)}
            className="mt-0.5 text-xs text-accent-600 hover:underline"
          >
            Ir a hoy
          </button>
        )}
      </div>

      <button
        onClick={() => go(+1)}
        disabled={isToday}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"
        aria-label="Día siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
