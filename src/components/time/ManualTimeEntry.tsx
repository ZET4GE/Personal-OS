'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Clock3, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createTimeEntry, getTimerTargets } from '@/services/time-entries'
import type { TimerTargetOption } from '@/types/time-entries'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function todayLocal() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function ManualTimeEntry() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [date, setDate] = useState(todayLocal)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)
  const [description, setDescription] = useState('')
  const [targetType, setTargetType] = useState<'none' | 'project' | 'goal'>('none')
  const [targetId, setTargetId] = useState('')
  const [projects, setProjects] = useState<TimerTargetOption[]>([])
  const [goals, setGoals] = useState<TimerTargetOption[]>([])

  useEffect(() => {
    if (!open) return
    getTimerTargets().then((res) => {
      if (res.data) {
        setProjects(res.data.projects)
        setGoals(res.data.goals)
      }
    })
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const totalSeconds = hours * 3600 + minutes * 60
    if (totalSeconds <= 0) {
      toast.error('La duración debe ser mayor a 0')
      return
    }

    const startedAt = new Date(`${date}T12:00:00`).toISOString()
    const endedAt = new Date(new Date(`${date}T12:00:00`).getTime() + totalSeconds * 1000).toISOString()

    startTransition(async () => {
      const result = await createTimeEntry({
        startedAt,
        endedAt,
        duration: totalSeconds,
        description: description.trim() || undefined,
        projectId: targetType === 'project' ? targetId || null : null,
        goalId: targetType === 'goal' ? targetId || null : null,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Sesión registrada')
      setDate(todayLocal())
      setHours(0)
      setMinutes(30)
      setDescription('')
      setTargetType('none')
      setTargetId('')
      setOpen(false)
      router.refresh()
    })
  }

  const targetOptions = targetType === 'project' ? projects : targetType === 'goal' ? goals : []

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <Clock3 size={15} className="text-accent-600 dark:text-accent-400" />
          Registrar sesión manual
        </div>
        {open ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-border px-4 pb-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date */}
            <div>
              <label className="mb-1 block text-xs text-muted">Fecha</label>
              <input
                type="date"
                value={date}
                max={todayLocal()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text outline-none focus:border-accent-600"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1 block text-xs text-muted">Duración</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-center text-sm text-text outline-none focus:border-accent-600"
                />
                <span className="text-xs text-muted">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-center text-sm text-text outline-none focus:border-accent-600"
                />
                <span className="text-xs text-muted">m</span>
              </div>
            </div>

            {/* Target type */}
            <div>
              <label className="mb-1 block text-xs text-muted">Asignar a</label>
              <select
                value={targetType}
                onChange={(e) => { setTargetType(e.target.value as 'none' | 'project' | 'goal'); setTargetId('') }}
                className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2 text-sm text-text outline-none focus:border-accent-600 [&>option]:bg-zinc-950"
              >
                <option value="none">Sin asignar</option>
                <option value="project">Proyecto</option>
                <option value="goal">Meta</option>
              </select>
            </div>

            {/* Target selector (shown when project or goal selected) */}
            {targetType !== 'none' && (
              <div>
                <label className="mb-1 block text-xs text-muted capitalize">{targetType === 'project' ? 'Proyecto' : 'Meta'}</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2 text-sm text-text outline-none focus:border-accent-600 [&>option]:bg-zinc-950"
                >
                  <option value="">Seleccionar…</option>
                  {targetOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-3">
            <label className="mb-1 block text-xs text-muted">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿En qué trabajaste?"
              maxLength={200}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text outline-none focus:border-accent-600"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Plus size={14} />
              {isPending ? 'Guardando…' : 'Registrar sesión'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
