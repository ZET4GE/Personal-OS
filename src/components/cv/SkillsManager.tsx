'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Plus, X, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { createSkillAction, deleteSkillAction } from '@/app/(dashboard)/cv/actions'
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
} from '@/types/cv'
import type { Skill, SkillCategory } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Optimistic state
// ─────────────────────────────────────────────────────────────

type OptimisticSkill = Skill & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    item: OptimisticSkill }
  | { type: 'delete'; id: string }

function reducer(state: OptimisticSkill[], op: OptimisticOp): OptimisticSkill[] {
  if (op.type === 'add')    return [...state, op.item]
  if (op.type === 'delete') return state.filter((s) => s.id !== op.id)
  return state
}

// ─────────────────────────────────────────────────────────────
// Inline add form
// ─────────────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:bg-slate-900'

function AddSkillForm({ onAdd }: { onAdd: (formData: FormData) => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<SkillCategory>('technical')
  const [level, setLevel] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    const fd = new FormData(e.currentTarget)
    onAdd(fd)
    setName('')
    setLevel('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border bg-surface p-4"
    >
      {/* Name */}
      <div className="flex flex-col gap-1 flex-1 min-w-36">
        <label className="text-xs font-medium text-muted">Nombre *</label>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="TypeScript, Liderazgo..."
          className={inputCls + ' w-full'}
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Categoría</label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
          className={inputCls}
        >
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{SKILL_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Level */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">Nivel</label>
        <select
          name="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className={inputCls}
        >
          <option value="">Sin especificar</option>
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus size={15} /> Agregar
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────
// Skill badge with delete
// ─────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  beginner:     'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  advanced:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  expert:       'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
}

function SkillBadge({
  skill,
  onDelete,
}: {
  skill: OptimisticSkill
  onDelete: (formData: FormData) => void
}) {
  return (
    <span
      className={[
        'group flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-opacity',
        skill.level ? LEVEL_COLORS[skill.level] : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        skill.isOptimistic ? 'opacity-50' : '',
      ].join(' ')}
    >
      {skill.name}
      {skill.level && (
        <span className="text-xs opacity-60">· {SKILL_LEVEL_LABELS[skill.level]}</span>
      )}
      <form
        action={onDelete}
        onSubmit={(e) => {
          if (!confirm(`¿Eliminar "${skill.name}"?`)) e.preventDefault()
        }}
        className="inline"
      >
        <input type="hidden" name="id" value={skill.id} />
        <button
          type="submit"
          disabled={skill.isOptimistic}
          className="ml-0.5 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover:opacity-100 disabled:opacity-30"
          aria-label={`Eliminar ${skill.name}`}
        >
          <X size={11} />
        </button>
      </form>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function SkillsManager({ items }: { items: Skill[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition] = useTransition()

  function handleAdd(formData: FormData) {
    const optimisticSkill: OptimisticSkill = {
      id:          `optimistic-${Date.now()}`,
      user_id:     '',
      name:        String(formData.get('name') ?? ''),
      category:    (formData.get('category') as SkillCategory) ?? 'technical',
      level:       (formData.get('level') as Skill['level']) || null,
      order_index: 0,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', item: optimisticSkill })
      const result = await createSkillAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Skill agregada')
    })
  }

  function handleDelete(formData: FormData) {
    const id = String(formData.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const result = await deleteSkillAction(formData)
      if (result.error) toast.error(result.error)
      else              toast.success('Skill eliminada')
    })
  }

  // Group by category
  const grouped = SKILL_CATEGORIES.reduce<Record<SkillCategory, OptimisticSkill[]>>(
    (acc, cat) => {
      acc[cat] = optimistic.filter((s) => s.category === cat)
      return acc
    },
    {} as Record<SkillCategory, OptimisticSkill[]>,
  )

  const hasSkills = optimistic.length > 0

  return (
    <div className="space-y-6">
      {/* Add form */}
      <AddSkillForm onAdd={handleAdd} />

      {/* Grouped skills */}
      {!hasSkills ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Zap size={24} className="text-muted" />
          </span>
          <p className="font-medium">Sin skills registradas todavía</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Usa el formulario de arriba para agregar tus primeras skills.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {SKILL_CATEGORIES.map((cat) => {
            const skills = grouped[cat]
            if (skills.length === 0) return null
            return (
              <section key={cat}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                  {SKILL_CATEGORY_LABELS[cat]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <SkillBadge key={skill.id} skill={skill} onDelete={handleDelete} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
