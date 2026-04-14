'use client'

interface GoalProgressProps {
  progress: number   // 0-100
  size?:    number   // px diameter, default 120
  stroke?:  number   // stroke width, default 8
  color?:   string   // tailwind color class for stroke (e.g. 'text-blue-500')
}

export function GoalProgress({
  progress,
  size   = 120,
  stroke = 8,
  color,
}: GoalProgressProps) {
  const radius      = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset      = circumference - (progress / 100) * circumference

  // Color by progress level if not explicitly provided
  const strokeColor = color ?? (
    progress >= 70 ? 'text-emerald-500' :
    progress >= 30 ? 'text-amber-500' :
    'text-red-500'
  )

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-label={`Progreso: ${progress}%`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeColor} transition-all duration-700 ease-out`}
        />
      </svg>
      {/* Center label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-bold leading-none ${size >= 100 ? 'text-2xl' : 'text-base'} text-text`}>
          {progress}%
        </span>
        {size >= 100 && (
          <span className="text-[10px] text-muted mt-0.5">progreso</span>
        )}
      </div>
    </div>
  )
}
