'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Plus, Star, X, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { createSkillAction, deleteSkillAction } from '@/app/(dashboard)/cv/actions'
import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
} from '@/types/cv'
import type { Skill, SkillCategory } from '@/types/cv'

// ─── Optimistic state ─────────────────────────────────────────────────────────

type OptimisticSkill = Skill & { isOptimistic?: boolean }

type OptimisticOp =
  | { type: 'add';    item: OptimisticSkill }
  | { type: 'delete'; id: string }

function reducer(state: OptimisticSkill[], op: OptimisticOp): OptimisticSkill[] {
  if (op.type === 'add')    return [...state, op.item]
  if (op.type === 'delete') return state.filter((s) => s.id !== op.id)
  return state
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  'rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:bg-slate-900'

// ─── Subcategory suggestions per main category ────────────────────────────────

const SUBCATEGORY_SUGGESTIONS: Record<SkillCategory, string[]> = {
  technical: ['Backend', 'Frontend', 'Mobile', 'Cloud', 'DevOps', 'Networking', 'Base de datos', 'Seguridad', 'IA / ML'],
  soft:      ['Comunicación', 'Liderazgo', 'Trabajo en equipo', 'Gestión', 'Resolución de problemas'],
  language:  ['Certificación', 'Conversación', 'Escritura'],
  tool:      ['IDE', 'CRM', 'Diseño', 'Productividad', 'Testing'],
}

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddSkillForm({ onAdd }: { onAdd: (formData: FormData) => void }) {
  const [name,        setName]        = useState('')
  const [category,    setCategory]    = useState<SkillCategory>('technical')
  const [subcategory, setSubcategory] = useState('')
  const [hasLevel,    setHasLevel]    = useState(false)
  const [levelPct,    setLevelPct]    = useState(50)
  const [isTop,       setIsTop]       = useState(false)
  const [keywords,    setKeywords]    = useState('')
  const [evidence,    setEvidence]    = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    const fd = new FormData(e.currentTarget)
    if (!hasLevel) fd.delete('level_pct')
    onAdd(fd)
    setName('')
    setSubcategory('')
    setHasLevel(false)
    setLevelPct(50)
    setIsTop(false)
    setKeywords('')
    setEvidence('')
    setEvidenceUrl('')
  }

  const suggestions = SUBCATEGORY_SUGGESTIONS[category] ?? []

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-dashed border-border bg-surface p-4"
    >
      {/* Row 1: name + category + subcategory */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-1 min-w-36 flex-col gap-1">
          <label className="text-xs font-medium text-muted">Nombre *</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="TypeScript, Inglés..."
            className={inputCls + ' w-full'}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Categoría</label>
          <select
            name="category"
            value={category}
            onChange={(e) => { setCategory(e.target.value as SkillCategory); setSubcategory('') }}
            className={inputCls}
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{SKILL_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 min-w-32 flex-col gap-1">
          <label className="text-xs font-medium text-muted">
            Subcategoría <span className="opacity-50">(opcional)</span>
          </label>
          <input
            name="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            list="subcategory-datalist"
            placeholder="Backend, Networking..."
            className={inputCls + ' w-full'}
          />
          <datalist id="subcategory-datalist">
            {suggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      {/* Row 2: level toggle + slider + top skill + submit */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={hasLevel}
            onChange={(e) => setHasLevel(e.target.checked)}
            className="accent-accent-500"
          />
          Nivel de dominio
        </label>

        {hasLevel && (
          <div className="flex flex-1 min-w-48 items-center gap-3">
            <input
              type="range"
              name="level_pct"
              min="0"
              max="100"
              step="5"
              value={levelPct}
              onChange={(e) => setLevelPct(Number(e.target.value))}
              className="flex-1 accent-accent-500"
            />
            <div className="relative h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <span className="w-8 text-right text-sm font-semibold tabular-nums text-text">
              {levelPct}%
            </span>
          </div>
        )}

        <label className="ml-auto flex cursor-pointer select-none items-center gap-1.5 text-sm text-muted">
          <input
            type="checkbox"
            name="is_top"
            value="true"
            checked={isTop}
            onChange={(e) => setIsTop(e.target.checked)}
            className="accent-accent-500"
          />
          <Star size={13} className={isTop ? 'fill-amber-400 text-amber-400' : ''} />
          Top skill
        </label>

        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {/* Row 3: ATS fields */}
      <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Keywords ATS</label>
          <input
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Linux, NOC, Redes"
            className={inputCls + ' w-full'}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Evidencia</label>
          <input
            name="evidence"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Usado en proyecto X"
            className={inputCls + ' w-full'}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted">Link evidencia</label>
          <input
            name="evidence_url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://..."
            className={inputCls + ' w-full'}
          />
        </div>
      </div>
    </form>
  )
}

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  onDelete,
}: {
  skill: OptimisticSkill
  onDelete: (formData: FormData) => void
}) {
  return (
    <div
      className={[
        'group relative flex items-start gap-2 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-border-bright',
        skill.isOptimistic ? 'opacity-50' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {skill.is_top && (
            <Star size={11} className="shrink-0 fill-amber-400 text-amber-400" />
          )}
          <p className="truncate text-sm font-medium text-text">{skill.name}</p>
        </div>

        {skill.level_pct != null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{ width: `${skill.level_pct}%` }}
              />
            </div>
            <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-muted">
              {skill.level_pct}%
            </span>
          </div>
        )}

        {(skill.keywords?.length > 0 || skill.evidence) && (
          <p className="mt-1 truncate text-[11px] text-muted">
            {[skill.keywords?.join(', '), skill.evidence].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <form
        action={onDelete}
        onSubmit={(e) => {
          if (!confirm(`¿Eliminar "${skill.name}"?`)) e.preventDefault()
        }}
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <input type="hidden" name="id" value={skill.id} />
        <button
          type="submit"
          disabled={skill.isOptimistic}
          className="rounded-full p-0.5 text-muted transition-colors hover:bg-slate-100 hover:text-text disabled:opacity-30 dark:hover:bg-slate-800"
          aria-label={`Eliminar ${skill.name}`}
        >
          <X size={12} />
        </button>
      </form>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SkillsManager({ items }: { items: Skill[] }) {
  const [optimistic, dispatch] = useOptimistic(items, reducer)
  const [, startTransition]    = useTransition()

  function handleAdd(formData: FormData) {
    const levelRaw = formData.get('level_pct')
    const levelPct = (() => {
      if (!levelRaw || levelRaw === '') return null
      const n = parseInt(String(levelRaw), 10)
      return isNaN(n) ? null : Math.min(100, Math.max(0, n))
    })()

    const optimisticSkill: OptimisticSkill = {
      id:           `optimistic-${Date.now()}`,
      user_id:      '',
      name:         String(formData.get('name') ?? ''),
      category:     (formData.get('category') as SkillCategory) ?? 'technical',
      subcategory:  String(formData.get('subcategory') ?? '').trim() || null,
      level:        null,
      level_pct:    levelPct,
      is_top:       formData.get('is_top') === 'true',
      evidence:     String(formData.get('evidence') ?? '').trim() || null,
      evidence_url: String(formData.get('evidence_url') ?? '').trim() || null,
      keywords:     String(formData.get('keywords') ?? '')
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      order_index:  0,
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

  // Build ordered groups, preserving insertion order of first appearance
  const groupMap = new Map<string, { label: string; skills: OptimisticSkill[] }>()
  for (const skill of optimistic) {
    const key = `${skill.category}::${skill.subcategory ?? ''}`
    if (!groupMap.has(key)) {
      const catLabel = SKILL_CATEGORY_LABELS[skill.category] ?? skill.category
      const label    = skill.subcategory ? `${catLabel} · ${skill.subcategory}` : catLabel
      groupMap.set(key, { label, skills: [] })
    }
    groupMap.get(key)!.skills.push(skill)
  }

  const hasSkills = optimistic.length > 0

  return (
    <div className="space-y-6">
      <AddSkillForm onAdd={handleAdd} />

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
        <div className="space-y-6">
          {[...groupMap.values()].map(({ label, skills }) => (
            <section key={label}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                {label}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
