import { Flame } from 'lucide-react'

export function StreakWidget({ currentStreak, bestStreak }: { currentStreak: number; bestStreak: number }) {
  let message = '¡Empieza tu racha hoy!'
  if (currentStreak > 0 && currentStreak < 3) message = '¡Buen comienzo!'
  else if (currentStreak >= 3 && currentStreak < 7) message = '¡Estás en racha!'
  else if (currentStreak >= 7 && currentStreak < 21) message = '¡Imparable! 🔥'
  else if (currentStreak >= 21) message = '¡Leyenda viva! 👑'

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-6 shadow-[var(--shadow-card)]">
      <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 dark:bg-orange-500/15">
        <Flame className="absolute text-orange-500" size={40} />
      </div>
      
      <p className="text-4xl font-bold tracking-tight text-text">
        {currentStreak}
      </p>
      
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">
        Días seguidos
      </p>
      
      <p className="mt-4 text-center text-sm font-medium text-text">
        {message}
      </p>
      
      {bestStreak > 0 && (
        <p className="mt-2 text-xs text-muted">
          Mejor racha: <span className="font-semibold text-text">{bestStreak}</span> días
        </p>
      )}
    </div>
  )
}