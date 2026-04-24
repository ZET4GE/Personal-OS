'use client'

import { useState, useTransition } from 'react'
import { GOAL_MOODS, MOOD_META } from '@/types/goals'
import type { GoalMood } from '@/types/goals'
import { createGoalUpdateAction } from '@/app/(dashboard)/goals/actions'

interface GoalUpdateFormProps {
  goalId: string
}

export function GoalUpdateForm({ goalId }: GoalUpdateFormProps) {
  const [content, setContent] = useState('')
  const [mood, setMood]       = useState<GoalMood | ''>('')
  const [error, setError]     = useState('')
  const [isPending, start]    = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')

    const fd = new FormData()
    fd.set('goal_id', goalId)
    fd.set('content', content.trim())
    if (mood) fd.set('mood', mood)

    start(async () => {
      const result = await createGoalUpdateAction(fd)
      if (!result.success) {
        setError(result.error)
        return
      }
      setContent('')
      setMood('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Mood selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">Estado:</span>
        {GOAL_MOODS.map((m) => {
          const meta = MOOD_META[m]
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMood((prev) => (prev === m ? '' : m))}
              title={meta.label}
              className={[
                'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
                mood === m
                  ? 'bg-accent-600/10 text-accent-600 ring-1 ring-accent-600/30'
                  : 'bg-surface-elevated text-muted hover:bg-surface-hover hover:text-foreground',
              ].join(' ')}
            >
              <span>{meta.emoji}</span>
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          )
        })}
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Cómo va tu progreso? Anotá una actualización..."
        rows={3}
        disabled={isPending}
        className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-muted focus:border-accent-600 focus:outline-none transition-colors"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Publicar actualización'}
        </button>
      </div>
    </form>
  )
}
