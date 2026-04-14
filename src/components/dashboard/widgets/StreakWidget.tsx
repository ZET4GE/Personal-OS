import { Flame } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function StreakWidget({ currentStreak, bestStreak }: { currentStreak: number; bestStreak: number }) {
  const t = await getTranslations('dashboard')

  let messageKey: 'streak.messages.start' | 'streak.messages.beginning' | 'streak.messages.rolling' | 'streak.messages.unstoppable' | 'streak.messages.legend'
  if (currentStreak === 0)          messageKey = 'streak.messages.start'
  else if (currentStreak < 3)       messageKey = 'streak.messages.beginning'
  else if (currentStreak < 7)       messageKey = 'streak.messages.rolling'
  else if (currentStreak < 21)      messageKey = 'streak.messages.unstoppable'
  else                               messageKey = 'streak.messages.legend'

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-6 shadow-[var(--shadow-card)]">
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/15">
        <Flame className="absolute text-orange-500" size={40} />
      </div>

      <p className="text-4xl font-bold tracking-tight text-text">
        {currentStreak}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">
        {t('streak.daysLabel')}
      </p>

      <p className="mt-4 text-center text-sm font-medium text-text">
        {t(messageKey)}
      </p>

      {bestStreak > 0 && (
        <p className="mt-2 text-xs text-muted">
          {t('streak.bestStreak', { count: bestStreak })}
        </p>
      )}
    </div>
  )
}
