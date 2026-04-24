'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import {
  GOAL_CATEGORIES, GOAL_PRIORITIES, GOAL_COLORS,
  CATEGORY_META, GOAL_COLOR_STYLES,
} from '@/types/goals'
import type { Goal } from '@/types/goals'
import { createGoalAction, updateGoalAction } from '@/app/(dashboard)/goals/actions'

const COMMON_ICONS = ['🎯', '🚀', '💡', '📚', '💪', '💰', '🌟', '🏆', '✍️', '🎨', '🔧', '🌍']

interface MilestoneInput {
  title: string
  tempId: string
}

interface GoalFormProps {
  goal?: Goal
}

export function GoalForm({ goal }: GoalFormProps) {
  const router         = useRouter()
  const [isPending, start] = useTransition()

  const [title, setTitle]             = useState(goal?.title ?? '')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [category, setCategory]       = useState(goal?.category ?? 'personal')
  const [priority, setPriority]       = useState(goal?.priority ?? 'medium')
  const [color, setColor]             = useState(goal?.color ?? 'blue')
  const [icon, setIcon]               = useState(goal?.icon ?? '')
  const [targetDate, setTargetDate]   = useState(goal?.target_date ?? '')
  const [isPublic, setIsPublic]       = useState(goal?.is_public ?? false)
  const [milestones, setMilestones]   = useState<MilestoneInput[]>([])
  const [newMilestone, setNewMilestone] = useState('')
  const [error, setError]             = useState('')

  function addMilestone() {
    if (!newMilestone.trim()) return
    setMilestones((prev) => [...prev, { title: newMilestone.trim(), tempId: crypto.randomUUID() }])
    setNewMilestone('')
  }

  function removeMilestone(tempId: string) {
    setMilestones((prev) => prev.filter((m) => m.tempId !== tempId))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido'); return }
    setError('')

    const fd = new FormData()
    if (goal) fd.set('id', goal.id)
    fd.set('title', title)
    fd.set('description', description)
    fd.set('category', category)
    fd.set('priority', priority)
    fd.set('color', color)
    fd.set('icon', icon)
    fd.set('target_date', targetDate)
    fd.set('is_public', String(isPublic))

    start(async () => {
      if (goal) {
        const result = await updateGoalAction(fd)
        if (!result.success) { setError(result.error); return }
        router.push(`/goals/${goal.id}`)
      } else {
        const result = await createGoalAction(fd)
        if (!result.success) { setError(result.error); return }

        // Create milestones
        const { createMilestoneAction } = await import('@/app/(dashboard)/goals/actions')
        for (let i = 0; i < milestones.length; i++) {
          const mfd = new FormData()
          mfd.set('goal_id', result.goal.id)
          mfd.set('title', milestones[i].title)
          mfd.set('order_index', String(i))
          await createMilestoneAction(mfd)
        }

        router.push(`/goals/${result.goal.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Título *</label>
        <div className="flex gap-2">
          {/* Icon picker */}
          <div className="relative group">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-lg transition-colors hover:border-border-bright"
            >
              {icon || '🎯'}
            </button>
            <div className="absolute left-0 top-12 z-10 hidden group-hover:flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg w-48">
              {COMMON_ICONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className="rounded-md p-1.5 text-base hover:bg-surface-hover"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mi objetivo principal..."
            required
            className="flex-1 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="¿Por qué es importante esta meta para vos?"
          className="w-full resize-none rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border',
                  category === cat
                    ? 'border-accent-600 bg-accent-600/10 text-accent-600'
                    : 'border-border bg-surface-elevated text-muted hover:border-border-bright hover:text-foreground',
                ].join(' ')}
              >
                <span>{meta.icon}</span>
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Priority + Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Prioridad</label>
          <div className="flex gap-2">
            {GOAL_PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={[
                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors',
                  priority === p
                    ? 'border-accent-600 bg-accent-600/10 text-accent-600'
                    : 'border-border bg-surface-elevated text-muted hover:border-border-bright',
                ].join(' ')}
              >
                {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Color</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map((c) => {
              const style = GOAL_COLOR_STYLES[c]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={[
                    'h-7 w-7 rounded-full transition-all',
                    style.bar,
                    color === c ? 'ring-2 ring-offset-2 ring-offset-surface scale-110' : 'opacity-60 hover:opacity-100',
                    style.ring,
                  ].join(' ')}
                  title={c}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Target date + public */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text">Fecha objetivo</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text focus:border-accent-600 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              role="checkbox"
              aria-checked={isPublic}
              onClick={() => setIsPublic((v) => !v)}
              className={[
                'h-5 w-9 rounded-full transition-colors cursor-pointer',
                isPublic ? 'bg-accent-600' : 'bg-border',
              ].join(' ')}
            >
              <div className={[
                'h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5',
                isPublic ? 'translate-x-4 ml-0.5' : 'translate-x-0.5',
              ].join(' ')} />
            </div>
            <span className="text-sm text-muted">Meta pública</span>
          </label>
        </div>
      </div>

      {/* Milestones — only on create */}
      {!goal && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Hitos iniciales</label>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.tempId} className="flex items-center gap-2">
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-border" />
                <span className="flex-1 text-sm text-text">{m.title}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.tempId)}
                  className="rounded p-1 text-muted hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone() } }}
                placeholder="Agregar hito..."
                className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={addMilestone}
                disabled={!newMilestone.trim()}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-border-bright hover:text-foreground disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-border-bright hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim() || isPending}
          className="rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-accent-600/20 transition-all hover:bg-accent-700 hover:shadow-md disabled:opacity-50"
        >
          {isPending
            ? 'Guardando...'
            : goal ? 'Guardar cambios' : 'Crear meta'}
        </button>
      </div>
    </form>
  )
}
