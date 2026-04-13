import type { DailyStat } from '@/types/analytics'

interface ViewsChartProps {
  data:  DailyStat[]
  days?: number
}

// ─────────────────────────────────────────────────────────────
// Gráfico SVG de líneas — sin dependencias externas.
// viewBox 800×200, área de trazado 720×140.
// ─────────────────────────────────────────────────────────────

const W = 800, H = 200
const PAD = { top: 16, right: 20, bottom: 36, left: 44 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top  - PAD.bottom

function formatLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function ViewsChart({ data, days = 30 }: ViewsChartProps) {
  if (data.length === 0) return null

  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const n        = data.length

  // Coordenadas de cada punto
  const points = data.map((d, i) => {
    const x = PAD.left + (i / (n - 1 || 1)) * PLOT_W
    const y = PAD.top  + PLOT_H - (d.views / maxViews) * PLOT_H
    return { x, y, ...d }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  // Área rellena (mismos puntos + cierre en la parte inferior)
  const areaPoints = [
    `${points[0].x},${PAD.top + PLOT_H}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${PAD.top + PLOT_H}`,
  ].join(' ')

  // Etiquetas X: mostrar cada 7 días (o menos si hay pocos puntos)
  const step = days <= 14 ? 3 : days <= 30 ? 7 : 14
  const xLabels = points.filter((_, i) => i === 0 || i === n - 1 || i % step === 0)

  // Etiquetas Y: 0, mitad, máximo
  const yLabels = [
    { value: 0,           y: PAD.top + PLOT_H },
    { value: Math.round(maxViews / 2), y: PAD.top + PLOT_H / 2 },
    { value: maxViews,    y: PAD.top },
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-label="Gráfico de visitas por día"
      role="img"
    >
      {/* Grid horizontal */}
      {yLabels.map(({ y }, i) => (
        <line
          key={i}
          x1={PAD.left} y1={y}
          x2={W - PAD.right} y2={y}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      ))}

      {/* Área rellena */}
      <polygon
        points={areaPoints}
        fill="var(--color-accent-600)"
        fillOpacity={0.08}
      />

      {/* Línea principal */}
      <polyline
        points={polyline}
        fill="none"
        stroke="var(--color-accent-600)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Puntos — solo para series cortas */}
      {n <= 14 && points.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={3}
          fill="var(--color-accent-600)"
        />
      ))}

      {/* Etiquetas Y */}
      {yLabels.map(({ value, y }, i) => (
        <text
          key={i}
          x={PAD.left - 8} y={y}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={10}
          fill="currentColor"
          opacity={0.5}
        >
          {value}
        </text>
      ))}

      {/* Etiquetas X */}
      {xLabels.map((p, i) => (
        <text
          key={i}
          x={p.x} y={H - 8}
          textAnchor="middle"
          fontSize={10}
          fill="currentColor"
          opacity={0.5}
        >
          {formatLabel(p.date)}
        </text>
      ))}
    </svg>
  )
}
