'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { LearningRoadmap, LearningRoadmapType } from '@/types/roadmaps'

interface RoadmapsClientProps {
  roadmaps: LearningRoadmap[]
}

const ROADMAP_TYPES: { value: LearningRoadmapType; label: string; desc: string }[] = [
  {
    value: 'free',
    label: 'Libre',
    desc: 'Canvas flexible. Conectas nodos como quieras, ideal para ideas sueltas o exploracion.',
  },
  {
    value: 'structured',
    label: 'Plan de estudio',
    desc: 'Camino guiado por niveles. Ordena fundamentos, intermedio y avanzado.',
  },
  {
    value: 'goal_based',
    label: 'Basado en metas',
    desc: 'Igual que plan de estudio, pero el avance sale de las metas conectadas.',
  },
]

function getRoadmapTypeLabel(type: LearningRoadmapType) {
  return ROADMAP_TYPES.find((item) => item.value === type)?.label ?? 'Libre'
}

export function RoadmapsClient({ roadmaps: initialRoadmaps }: RoadmapsClientProps) {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<LearningRoadmapType>('free')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<LearningRoadmapType>('free')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreateRoadmap() {
    if (!title.trim() || isSaving) return
    setIsSaving(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error('Sesion invalida')
      setIsSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('learning_roadmaps')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        type,
        is_public: false,
      })
      .select('*')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'No se pudo crear el roadmap')
      setIsSaving(false)
      return
    }

    const newRoadmap = data as LearningRoadmap
    setRoadmaps((current) => [newRoadmap, ...current])
    setTitle('')
    setDescription('')
    setType('free')
    setIsSaving(false)
    toast.success('Roadmap creado')
    router.push(`/roadmaps/${newRoadmap.id}`)
    router.refresh()
  }

  function startEdit(roadmap: LearningRoadmap) {
    setEditingId(roadmap.id)
    setEditTitle(roadmap.title)
    setEditDescription(roadmap.description ?? '')
    setEditType(roadmap.type)
  }

  async function handleUpdateRoadmap(id: string) {
    if (!editTitle.trim() || isSaving) return
    setIsSaving(true)

    const { data, error } = await supabase
      .from('learning_roadmaps')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        type: editType,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'No se pudo actualizar')
      setIsSaving(false)
      return
    }

    setRoadmaps((current) => current.map((item) => (item.id === id ? data as LearningRoadmap : item)))
    setEditingId(null)
    setIsSaving(false)
    toast.success('Roadmap actualizado')
    router.refresh()
  }

  async function handleDeleteRoadmap(id: string) {
    if (!window.confirm('Eliminar este roadmap? Esta accion no se puede deshacer.')) return
    setIsSaving(true)

    const { error } = await supabase
      .from('learning_roadmaps')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message || 'No se pudo eliminar')
      setIsSaving(false)
      return
    }

    setRoadmaps((current) => current.filter((item) => item.id !== id))
    setIsSaving(false)
    toast.success('Roadmap eliminado')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch size={16} className="text-cyan-400" />
          <h1 className="text-xl font-semibold text-text">Learning Roadmaps</h1>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titulo del roadmap"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripcion breve"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
          />
          <button
            type="button"
            onClick={handleCreateRoadmap}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={14} />
            {isSaving ? 'Creando...' : 'Nuevo roadmap'}
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {ROADMAP_TYPES.map((item) => {
            const isSelected = type === item.value

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={[
                  'rounded-xl border px-4 py-3 text-left transition-all hover:scale-[1.01]',
                  isSelected
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-100'
                    : 'border-border bg-surface-2 text-muted hover:text-text',
                ].join(' ')}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 opacity-75">{item.desc}</p>
              </button>
            )
          })}
        </div>
      </section>

      {roadmaps.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-sm font-medium text-text">Todavia no tenes roadmaps</p>
          <p className="mt-1 text-sm text-muted">Crea el primero para organizar skills, topics y metas.</p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-border-bright"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                  {getRoadmapTypeLabel(roadmap.type)}
                </span>
                {roadmap.is_public ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
                    Publico
                  </span>
                ) : null}
              </div>

              {editingId === roadmap.id ? (
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                  />
                  <select
                    value={editType}
                    onChange={(event) => setEditType(event.target.value as LearningRoadmapType)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                  >
                    {ROADMAP_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateRoadmap(roadmap.id)}
                      disabled={isSaving || !editTitle.trim()}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                    >
                      <Save size={13} />
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text"
                    >
                      <X size={13} />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href={`/roadmaps/${roadmap.id}`} className="block">
                    <h2 className="text-lg font-semibold text-text transition-colors group-hover:text-white">
                      {roadmap.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                      {roadmap.description || 'Sin descripcion'}
                    </p>
                  </Link>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(roadmap)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoadmap(roadmap.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 size={13} />
                      Borrar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
