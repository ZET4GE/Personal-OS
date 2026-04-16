'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ElementType } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, BriefcaseBusiness, GitBranch, Pencil, Plus, Save, Sparkles, Target, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Goal } from '@/types/goals'
import type { LearningNodeType, LearningRoadmap, LearningRoadmapTemplate, LearningRoadmapType } from '@/types/roadmaps'

interface RoadmapsClientProps {
  roadmaps: LearningRoadmap[]
  availableGoals: Goal[]
}

interface TemplateNode {
  title: string
  description: string
  type: LearningNodeType
  level: string
}

const ROADMAP_TYPES: { value: LearningRoadmapType; label: string; desc: string; example: string }[] = [
  {
    value: 'goal_based',
    label: 'Basado en meta',
    desc: 'El camino nace de una meta concreta y mide avance con metas conectadas.',
    example: 'Ej: conseguir clientes, terminar AWS, crear un SaaS.',
  },
  {
    value: 'structured',
    label: 'Plan guiado',
    desc: 'Camino por etapas ordenadas. Ideal para cursos, carreras o aprendizaje.',
    example: 'Ej: fundamentos -> practica -> proyecto -> evaluacion.',
  },
  {
    value: 'free',
    label: 'Libre',
    desc: 'Mapa flexible para ideas. Podes conectar nodos sin orden obligatorio.',
    example: 'Ej: brainstorming, research, mapa mental.',
  },
]

const ROADMAP_TEMPLATES: {
  value: LearningRoadmapTemplate
  label: string
  desc: string
  icon: ElementType
  nodes: TemplateNode[]
}[] = [
  {
    value: 'skill',
    label: 'Aprender habilidad',
    desc: 'Fundamentos, practica, proyecto y revision.',
    icon: BookOpen,
    nodes: [
      { title: 'Fundamentos', description: 'Entender conceptos base y vocabulario.', type: 'topic', level: 'Fundamentos' },
      { title: 'Practica diaria', description: 'Convertir teoria en ejercicios repetibles.', type: 'skill', level: 'Practica' },
      { title: 'Proyecto aplicado', description: 'Construir algo real usando lo aprendido.', type: 'topic', level: 'Proyecto' },
      { title: 'Revision y mejora', description: 'Medir resultados, corregir huecos y documentar.', type: 'topic', level: 'Revision' },
    ],
  },
  {
    value: 'project',
    label: 'Crear proyecto',
    desc: 'Idea, MVP, lanzamiento e iteracion.',
    icon: Sparkles,
    nodes: [
      { title: 'Definir objetivo', description: 'Clarificar problema, usuario y resultado esperado.', type: 'topic', level: 'Plan' },
      { title: 'MVP', description: 'Construir la version minima funcional.', type: 'skill', level: 'Construccion' },
      { title: 'Lanzamiento', description: 'Publicar, probar con usuarios y recopilar feedback.', type: 'topic', level: 'Lanzamiento' },
      { title: 'Iteracion', description: 'Mejorar segun datos reales.', type: 'topic', level: 'Mejora' },
    ],
  },
  {
    value: 'clients',
    label: 'Conseguir clientes',
    desc: 'Portfolio, outreach, seguimiento y cierre.',
    icon: BriefcaseBusiness,
    nodes: [
      { title: 'Oferta clara', description: 'Definir servicio, nicho, precio y resultado.', type: 'topic', level: 'Estrategia' },
      { title: 'Portfolio', description: 'Preparar pruebas, casos o demos.', type: 'skill', level: 'Preparacion' },
      { title: 'Outreach', description: 'Contactar prospectos de forma consistente.', type: 'skill', level: 'Accion' },
      { title: 'Seguimiento y cierre', description: 'Responder objeciones y cerrar acuerdos.', type: 'topic', level: 'Cierre' },
    ],
  },
  {
    value: 'career',
    label: 'Carrera / curso',
    desc: 'Base, especializacion, experiencia y CV.',
    icon: Target,
    nodes: [
      { title: 'Base tecnica', description: 'Aprender los pilares necesarios.', type: 'topic', level: 'Base' },
      { title: 'Especializacion', description: 'Elegir foco y practicar casos reales.', type: 'skill', level: 'Foco' },
      { title: 'Experiencia demostrable', description: 'Crear proyectos, notas y evidencia.', type: 'topic', level: 'Portfolio' },
      { title: 'Salida profesional', description: 'Preparar CV, perfil y postulaciones.', type: 'topic', level: 'Trabajo' },
    ],
  },
  {
    value: 'blank',
    label: 'En blanco',
    desc: 'Empezar sin nodos iniciales.',
    icon: GitBranch,
    nodes: [],
  },
]

function getRoadmapTypeLabel(type: LearningRoadmapType) {
  return ROADMAP_TYPES.find((item) => item.value === type)?.label ?? 'Libre'
}

function getRoadmapTemplateLabel(template: LearningRoadmapTemplate | null | undefined) {
  return ROADMAP_TEMPLATES.find((item) => item.value === template)?.label ?? 'En blanco'
}

export function RoadmapsClient({ roadmaps: initialRoadmaps, availableGoals }: RoadmapsClientProps) {
  const [roadmaps, setRoadmaps] = useState(initialRoadmaps)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<LearningRoadmapType>('goal_based')
  const [template, setTemplate] = useState<LearningRoadmapTemplate>('skill')
  const [primaryGoalId, setPrimaryGoalId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState<LearningRoadmapType>('free')
  const [editPrimaryGoalId, setEditPrimaryGoalId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function createTemplateNodes(roadmapId: string, goalId: string | null) {
    const selectedTemplate = ROADMAP_TEMPLATES.find((item) => item.value === template)
    const templateNodes = selectedTemplate?.nodes ?? []
    let parentId: string | null = null

    for (let index = 0; index < templateNodes.length; index += 1) {
      const node = templateNodes[index]
      const insertResult: {
        data: { id: string } | null
        error: { message: string } | null
      } = await supabase
        .from('learning_nodes')
        .insert({
          roadmap_id: roadmapId,
          title: node.title,
          description: node.description,
          type: node.type,
          level: type === 'free' ? null : node.level,
          parent_id: type === 'free' ? null : parentId,
          status: 'pending',
          position: index,
          position_x: type === 'free' ? 120 + index * 280 : null,
          position_y: type === 'free' ? 120 : null,
        })
        .select('id')
        .single()

      if (insertResult.error || !insertResult.data) {
        throw new Error(insertResult.error?.message || 'No se pudo crear el template')
      }

      parentId = String(insertResult.data.id)

      if (goalId) {
        const { error: linkError } = await supabase
          .from('learning_node_goals')
          .insert({
            node_id: parentId,
            goal_id: goalId,
          })

        if (linkError) throw new Error(linkError.message)
      }
    }
  }

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

    const roadmapGoalId = primaryGoalId || null
    const { data, error } = await supabase
      .from('learning_roadmaps')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        type,
        template,
        primary_goal_id: roadmapGoalId,
        is_public: false,
      })
      .select('*')
      .single()

    if (error || !data) {
      toast.error(error?.message || 'No se pudo crear el roadmap')
      setIsSaving(false)
      return
    }

    try {
      await createTemplateNodes(String(data.id), roadmapGoalId)
    } catch (templateError) {
      toast.error(templateError instanceof Error ? templateError.message : 'No se pudo aplicar el template')
    }

    const newRoadmap = data as LearningRoadmap
    setRoadmaps((current) => [newRoadmap, ...current])
    setTitle('')
    setDescription('')
    setType('goal_based')
    setTemplate('skill')
    setPrimaryGoalId('')
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
    setEditPrimaryGoalId(roadmap.primary_goal_id ?? '')
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
        primary_goal_id: editPrimaryGoalId || null,
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
        <div className="mb-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Target size={17} className="text-cyan-400" />
            <h1 className="text-xl font-semibold text-text">Roadmaps guiados por metas</h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Crea un camino accionable: meta principal, plantilla inicial, nodos, habitos, rutinas y tiempo invertido.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Conseguir 3 clientes freelance"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Resultado esperado y contexto"
            className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-500"
          />
          <button
            type="button"
            onClick={handleCreateRoadmap}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={14} />
            {isSaving ? 'Creando...' : 'Crear roadmap'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Meta principal</p>
            <select
              value={primaryGoalId}
              onChange={(event) => setPrimaryGoalId(event.target.value)}
              className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2.5 text-sm text-text outline-none focus:border-accent-500 [&>option]:bg-zinc-950"
            >
              <option value="">Sin meta principal</option>
              {availableGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-muted">
              Recomendado: elegi una meta para que el roadmap tenga direccion y progreso real.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
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
                  <p className="mt-1 text-xs leading-5 opacity-80">{item.desc}</p>
                  <p className="mt-2 text-[11px] leading-4 opacity-60">{item.example}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Template inicial</p>
          <div className="grid gap-2 md:grid-cols-5">
            {ROADMAP_TEMPLATES.map((item) => {
              const Icon = item.icon
              const isSelected = template === item.value

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTemplate(item.value)}
                  className={[
                    'rounded-xl border p-3 text-left transition-all hover:scale-[1.01]',
                    isSelected
                      ? 'border-accent-500/60 bg-accent-500/10 text-text'
                      : 'border-border bg-surface-2 text-muted hover:text-text',
                  ].join(' ')}
                >
                  <Icon size={15} className="mb-2 text-cyan-400" />
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 opacity-75">{item.desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {roadmaps.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-sm font-medium text-text">Todavia no tenes roadmaps</p>
          <p className="mt-1 text-sm text-muted">Crea el primero desde una meta concreta para no arrancar en blanco.</p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roadmaps.map((roadmap) => {
            const primaryGoal = availableGoals.find((goal) => goal.id === roadmap.primary_goal_id)

            return (
              <div
                key={roadmap.id}
                className="group rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-border-bright"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    {getRoadmapTypeLabel(roadmap.type)}
                  </span>
                  <span className="rounded-full bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted">
                    {getRoadmapTemplateLabel(roadmap.template)}
                  </span>
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
                      className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2 text-sm text-text outline-none focus:border-accent-500 [&>option]:bg-zinc-950"
                    >
                      {ROADMAP_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <select
                      value={editPrimaryGoalId}
                      onChange={(event) => setEditPrimaryGoalId(event.target.value)}
                      className="w-full rounded-xl border border-border bg-zinc-950 px-3 py-2 text-sm text-text outline-none focus:border-accent-500 [&>option]:bg-zinc-950"
                    >
                      <option value="">Sin meta principal</option>
                      {availableGoals.map((goal) => (
                        <option key={goal.id} value={goal.id}>{goal.title}</option>
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
                      <div className="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Meta principal</p>
                        <p className="mt-1 truncate text-sm text-text">{primaryGoal?.title ?? 'Sin meta asignada'}</p>
                      </div>
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
            )
          })}
        </section>
      )}
    </div>
  )
}
