import { DAY_NAMES_SHORT, HABIT_COLOR_STYLES } from '@/types/habits'
import type { HabitDay, HabitColor } from '@/types/habits'

interface HabitMiniCalendarProps {
  days:  HabitDay[]   // 7 entries, oldest → newest
  color: HabitColor
}

export function HabitMiniCalendar({ days, color }: HabitMiniCalendarProps) {
  const styles = HABIT_COLOR_STYLES[color]

  return (
    <div className="flex gap-1">
      {days.map((day) => {
        const date = new Date(day.date + 'T12:00:00')
        const dow  = date.getDay()
        const label = DAY_NAMES_SHORT[dow]

        return (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-medium text-muted leading-none">{label[0]}</span>
            <div
              title={`${day.date}${day.completed ? ' ✓' : day.isDue ? ' —' : ' (no aplica)'}`}
              className={[
                'h-4 w-4 rounded-sm transition-colors',
                day.completed
                  ? `${styles.bg} opacity-90`
                  : day.isDue
                    ? 'bg-slate-200 dark:bg-slate-700'
                    : 'bg-slate-100 dark:bg-slate-800 opacity-50',
              ].join(' ')}
            />
          </div>
        )
      })}
    </div>
  )
}
