'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { LearningRoadmap } from '@/types/roadmaps'

interface RoadmapsClientProps {
  roadmaps: LearningRoadmap[]
}

export function RoadmapsClient({ roadmaps: initialRoadmaps }: RoadmapsClientProps) {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
    setIsSaving(false)
    toast.success('Roadmap creado')
    router.push(`/roadmaps/${newRoadmap.id}`)
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
      </section>

      {roadmaps.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-sm font-medium text-text">Todavia no tenes roadmaps</p>
          <p className="mt-1 text-sm text-muted">Crea el primero para organizar skills, topics y metas.</p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              href={`/roadmaps/${roadmap.id}`}
              className="group rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-border-bright"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                  Roadmap
                </span>
                {roadmap.is_public ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400">
                    Publico
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-semibold text-text transition-colors group-hover:text-white">
                {roadmap.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                {roadmap.description || 'Sin descripcion'}
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
