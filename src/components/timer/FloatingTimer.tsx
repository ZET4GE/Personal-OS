'use client'

import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Clock3,
  EyeOff,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useTimer } from '@/hooks/useTimer'
import { createTimeEntry, getTimerTargets } from '@/services/time-entries'
import type { TimerTargetOption } from '@/types/time-entries'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getPanelMetrics(isMinimized: boolean) {
  return {
    width: isMinimized ? 148 : 292,
    height: isMinimized ? 58 : 286,
    rightGap: 22,
  }
}

function playCompletionSound() {
  if (typeof window === 'undefined') return

  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.value = 0.04

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.2)

    window.setTimeout(() => {
      void context.close()
    }, 250)
  } catch {
    return
  }
}

export function FloatingTimer() {
  const {
    isRunning,
    elapsedTime,
    mode,
    minimized,
    hidden,
    transparency,
    position,
    countdownMinutes,
    finishedAt,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
    setMode,
    setMinimized,
    setHidden,
    setPosition,
    setTransparency,
    setCountdownMinutes,
    clearFinished,
  } = useTimer()

  const panelRef = useRef<HTMLDivElement>(null)
  const lastFinishedRef = useRef<number | null>(null)
  const [dragState, setDragState] = useState<{ offsetX: number; offsetY: number } | null>(null)
  const [projects, setProjects] = useState<TimerTargetOption[]>([])
  const [goals, setGoals] = useState<TimerTargetOption[]>([])
  const [projectId, setProjectId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [description, setDescription] = useState('')
  const [loadingTargets, setLoadingTargets] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [trackingSnapshot, setTrackingSnapshot] = useState<{ startTime: number; elapsedTime: number } | null>(null)

  const isCountdown = mode === 'countdown'
  const canSave = !!trackingSnapshot?.startTime && (trackingSnapshot?.elapsedTime ?? 0) > 0

  const launcherLabel = useMemo(() => {
    if (isRunning) return `${formattedTime} en curso`
    if (elapsedTime > 0) return `${formattedTime} listo`
    return 'Abrir timer'
  }, [elapsedTime, formattedTime, isRunning])
  const mounted = typeof document !== 'undefined'

  useEffect(() => {
    if (!dragState) return

    const activeDrag = dragState

    function handleMove(event: MouseEvent) {
      const panelRect = panelRef.current?.getBoundingClientRect()
      const panelWidth = panelRect?.width ?? (minimized ? 148 : 292)
      const panelHeight = panelRect?.height ?? (minimized ? 58 : 286)

      setPosition({
        x: clamp(event.clientX - activeDrag.offsetX, 8, window.innerWidth - panelWidth - 22),
        y: clamp(event.clientY - activeDrag.offsetY, 64, window.innerHeight - panelHeight - 8),
      })
    }

    function handleUp() {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragState, minimized, setPosition])

  useEffect(() => {
    if (!finishedAt || lastFinishedRef.current === finishedAt) return

    lastFinishedRef.current = finishedAt
    setHidden(false)
    setMinimized(false)
    toast.success('Tiempo terminado')
    playCompletionSound()
    clearFinished()
  }, [clearFinished, finishedAt, setHidden, setMinimized])

  function openPanel() {
    setHidden(false)
    setMinimized(false)
  }

  function closePanel() {
    setHidden(true)
    setMinimized(false)
  }

  function repositionPanel(nextMinimized: boolean) {
    if (typeof window === 'undefined') return

    const nextMetrics = getPanelMetrics(nextMinimized)
    const currentMetrics = getPanelMetrics(minimized)
    const currentRight = window.innerWidth - position.x - currentMetrics.width

    setPosition({
      x: currentRight <= nextMetrics.rightGap + 24 || nextMinimized
        ? window.innerWidth - nextMetrics.width - nextMetrics.rightGap
        : clamp(position.x, 8, window.innerWidth - nextMetrics.width - 8),
      y: clamp(position.y, 64, window.innerHeight - nextMetrics.height - 8),
    })
  }

  function togglePanel() {
    if (hidden) {
      openPanel()
      return
    }

    closePanel()
  }

  function handleMinimize() {
    repositionPanel(true)
    setMinimized(true)
  }

  function handleExpand() {
    repositionPanel(false)
    setMinimized(false)
  }

  function handleDragStart(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest('button, input, select, textarea, label')) return

    const panelRect = panelRef.current?.getBoundingClientRect()
    if (!panelRect) return

    setDragState({
      offsetX: event.clientX - panelRect.left,
      offsetY: event.clientY - panelRect.top,
    })
  }

  async function loadTargets() {
    setLoadingTargets(true)
    const result = await getTimerTargets()
    setLoadingTargets(false)

    if (result.error) {
      toast.error(result.error || 'Algo falló')
      return false
    }

    setProjects(result.data?.projects ?? [])
    setGoals(result.data?.goals ?? [])
    return true
  }

  async function handleStop() {
    const snapshot = stopTimer()

    if (isCountdown) return
    if (!snapshot.startTime || snapshot.elapsedTime <= 0) return

    const ready = await loadTargets()
    if (!ready) return

    setTrackingSnapshot({
      startTime: snapshot.startTime,
      elapsedTime: snapshot.elapsedTime,
    })
    setSaveModalOpen(true)
  }

  function handleReset() {
    resetTimer()
    setTrackingSnapshot(null)
    toast.success(isCountdown ? 'Temporizador reiniciado' : 'Timer reiniciado')
  }

  async function handleSaveSession() {
    if (!trackingSnapshot?.startTime || trackingSnapshot.elapsedTime <= 0) {
      toast.error('No hay tiempo para guardar')
      return
    }

    setSaving(true)
    const endedAt = new Date(trackingSnapshot.startTime + trackingSnapshot.elapsedTime)
    const result = await createTimeEntry({
      projectId: projectId || null,
      goalId: goalId || null,
      description,
      startedAt: new Date(trackingSnapshot.startTime).toISOString(),
      endedAt: endedAt.toISOString(),
      duration: Math.max(1, Math.floor(trackingSnapshot.elapsedTime / 1000)),
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error || 'Algo falló')
      return
    }

    toast.success('Sesión guardada')
    setSaveModalOpen(false)
    setTrackingSnapshot(null)
    setProjectId('')
    setGoalId('')
    setDescription('')
    resetTimer()
  }

  function handleCloseModal() {
    setSaveModalOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={togglePanel}
        title={launcherLabel}
        aria-label={launcherLabel}
        className="relative flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-muted transition-all duration-200 hover:bg-surface-hover hover:text-foreground"
      >
        <Clock3 size={16} />
        {(isRunning || elapsedTime > 0) ? (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-surface" />
        ) : null}
      </button>

      {mounted && !hidden ? createPortal(
        <div
          ref={panelRef}
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: `color-mix(in srgb, var(--color-surface-elevated) ${Math.round(transparency * 100)}%, transparent)`,
          }}
          className={[
            'fixed z-[10001] select-none rounded-2xl border border-border shadow-2xl backdrop-blur-md transition-all duration-200',
            minimized ? 'w-[148px]' : 'w-[292px]',
            dragState ? 'cursor-grabbing shadow-[0_18px_55px_rgba(0,0,0,0.22)]' : '',
          ].join(' ')}
        >
          {minimized ? (
            <div
              onMouseDown={handleDragStart}
              className="flex cursor-grab items-center gap-2 rounded-2xl px-3 py-2.5"
            >
              <button
                type="button"
                onClick={handleExpand}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-accent-600/10 text-accent-600 transition-colors hover:bg-accent-600/15"
              >
                <Clock3 size={15} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold text-text">{formattedTime}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {isCountdown ? 'Countdown' : 'Tracking'}
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <EyeOff size={14} />
              </button>
            </div>
          ) : (
            <div className="animate-scale-in p-3.5">
              <div
                onMouseDown={handleDragStart}
                className={[
                  'mb-3 flex items-center justify-between gap-3 rounded-xl px-1 py-1',
                  dragState ? 'cursor-grabbing' : 'cursor-grab',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600/10 text-accent-600">
                    {isCountdown ? <TimerReset size={16} /> : <Clock3 size={16} />}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Time system</p>
                    <p className="text-sm font-semibold text-text">
                      {isCountdown ? 'Temporizador' : 'Time tracking'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <Minimize2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface p-1">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setMode('tracking')}
                  className={[
                    'rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    mode === 'tracking'
                      ? 'bg-accent-600 text-white shadow-sm'
                      : 'cursor-pointer text-muted hover:bg-surface-hover hover:text-foreground',
                    isRunning ? 'cursor-not-allowed opacity-60' : '',
                  ].join(' ')}
                >
                  Tracking
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => setMode('countdown')}
                  className={[
                    'rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    mode === 'countdown'
                      ? 'bg-accent-600 text-white shadow-sm'
                      : 'cursor-pointer text-muted hover:bg-surface-hover hover:text-foreground',
                    isRunning ? 'cursor-not-allowed opacity-60' : '',
                  ].join(' ')}
                >
                  Countdown
                </button>
              </div>

              {isCountdown ? (
                <label className="mb-3 block">
                  <span className="mb-1 block text-sm font-medium text-text">Minutos</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={countdownMinutes}
                    disabled={isRunning}
                    onChange={(event) => setCountdownMinutes(Number(event.target.value))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              ) : null}

              <label className="mb-3 block">
                <span className="mb-1 block text-sm font-medium text-text">
                  Transparencia {Math.round(transparency * 100)}%
                </span>
                <input
                  type="range"
                  min={45}
                  max={100}
                  step={1}
                  value={Math.round(transparency * 100)}
                  onChange={(event) => setTransparency(Number(event.target.value) / 100)}
                  className="w-full cursor-pointer accent-accent-600"
                />
              </label>

              <div className="rounded-2xl bg-surface px-4 py-4 text-center">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  {isCountdown ? 'Tiempo restante' : 'Tiempo en vivo'}
                </p>
                <p className="mt-1.5 font-mono text-3xl font-bold tracking-tight text-text">
                  {formattedTime}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {isRunning ? (
                  <Button
                    type="button"
                    size="md"
                    variant="secondary"
                    icon={<Pause size={14} />}
                    className="flex-1"
                    onClick={handleStop}
                  >
                    {isCountdown ? 'Pausar' : 'Detener'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="md"
                    icon={<Play size={14} />}
                    className="flex-1"
                    onClick={startTimer}
                  >
                    Iniciar
                  </Button>
                )}

                <Button
                  type="button"
                  size="md"
                  variant="ghost"
                  icon={<RotateCcw size={14} />}
                  onClick={handleReset}
                  disabled={isRunning || elapsedTime === 0}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      ) : null}

      {saveModalOpen ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-md rounded-3xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Sesión finalizada</p>
                <h3 className="mt-1 text-xl font-semibold text-text">Guardar sesión</h3>
                <p className="mt-2 font-mono text-2xl font-bold text-accent-600">
                  {formattedTime}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-text">Proyecto</span>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  disabled={loadingTargets}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-text">Meta</span>
                <select
                  value={goalId}
                  onChange={(event) => setGoalId(event.target.value)}
                  disabled={loadingTargets}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Sin meta</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-text">Descripción</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Qué hiciste en esta sesión"
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-600"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cerrar
              </Button>
              <Button
                type="button"
                loading={saving}
                disabled={!canSave || loadingTargets}
                onClick={handleSaveSession}
              >
                Guardar sesión
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
