'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useTimer } from '@/hooks/useTimer'
import { createTimeEntry, getTimerTargets } from '@/services/time-entries'
import type { TimerTargetOption } from '@/types/time-entries'

export function GlobalTimer() {
  const {
    isRunning,
    startTime,
    elapsedTime,
    formattedTime,
    startTimer,
    stopTimer,
    resetTimer,
  } = useTimer()

  const dialogRef = useRef<HTMLDialogElement>(null)
  const [projects, setProjects] = useState<TimerTargetOption[]>([])
  const [goals, setGoals] = useState<TimerTargetOption[]>([])
  const [projectId, setProjectId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [description, setDescription] = useState('')
  const [loadingTargets, setLoadingTargets] = useState(false)
  const [saving, setSaving] = useState(false)

  const canSave = elapsedTime > 0 && !!startTime
  const compactTime = useMemo(() => formattedTime, [formattedTime])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      setProjectId('')
      setGoalId('')
      setDescription('')
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  async function loadTargets() {
    setLoadingTargets(true)
    const result = await getTimerTargets()
    setLoadingTargets(false)

    if (result.error) {
      toast.error(result.error || 'Algo falló')
      return
    }

    setProjects(result.data.projects)
    setGoals(result.data.goals)
  }

  async function handleStop() {
    const snapshot = stopTimer()
    if (!snapshot.startTime || snapshot.elapsedTime <= 0) return

    await loadTargets()
    dialogRef.current?.showModal()
  }

  function handleReset() {
    resetTimer()
    toast.success('Timer reiniciado')
  }

  async function handleSave() {
    if (!startTime || elapsedTime <= 0) {
      toast.error('No hay tiempo para guardar')
      return
    }

    setSaving(true)
    const endedAt = new Date()
    const result = await createTimeEntry({
      projectId: projectId || null,
      goalId: goalId || null,
      description,
      startedAt: new Date(startTime).toISOString(),
      endedAt: endedAt.toISOString(),
      duration: Math.max(1, Math.floor(elapsedTime / 1000)),
    })
    setSaving(false)

    if (result.error) {
      toast.error(result.error || 'Algo falló')
      return
    }

    toast.success('Sesión guardada')
    dialogRef.current?.close()
    resetTimer()
  }

  return (
    <>
      <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface-elevated px-2.5 py-1.5 shadow-[var(--shadow-card)] md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600/10 text-accent-600 dark:text-accent-400">
          <Timer size={14} />
        </span>

        <div className="min-w-[84px]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Timer</p>
          <p className="font-mono text-sm font-semibold text-text">{compactTime}</p>
        </div>

        {isRunning ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Pause size={13} />}
            onClick={handleStop}
          >
            Detener
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            icon={<Play size={13} />}
            onClick={startTimer}
          >
            Iniciar
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          icon={<RotateCcw size={13} />}
          onClick={handleReset}
          disabled={isRunning || elapsedTime === 0}
        >
          Reset
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(92vw,28rem)] rounded-2xl border border-border bg-surface-elevated p-0 text-text shadow-2xl backdrop:bg-black/50"
      >
        <div className="animate-scale-in p-5">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Sesión finalizada</p>
            <h3 className="mt-1 text-lg font-semibold">Guardar tiempo</h3>
            <p className="mt-2 font-mono text-2xl font-bold text-accent-600 dark:text-accent-400">
              {compactTime}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Proyecto</span>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-600"
                disabled={loadingTargets}
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
              <span className="text-sm font-medium">Meta</span>
              <select
                value={goalId}
                onChange={(event) => setGoalId(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent-600"
                disabled={loadingTargets}
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
              <span className="text-sm font-medium">Descripción</span>
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => dialogRef.current?.close()}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              loading={saving}
              disabled={!canSave || loadingTargets}
              onClick={handleSave}
            >
              Guardar sesión
            </Button>
          </div>
        </div>
      </dialog>
    </>
  )
}

