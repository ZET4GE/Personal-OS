'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { createProjectAction } from '@/app/(dashboard)/projects/actions'
import { createHabitAction } from '@/app/(dashboard)/habits/actions'
import { createRoutineAction } from '@/app/(dashboard)/routines/actions'
import { createNoteAction } from '@/app/(dashboard)/notes/actions'
import { getLinkableEntities, type LinkableGoalEntity } from '@/services/goal-entities'
import { linkEntityToGoal, type GoalLinkEntityType } from '@/services/goal-links'

interface AddToGoalModalProps {
  goalId: string
  entityType: GoalLinkEntityType
  linkedIds: string[]
  onLinked: (entity: LinkableGoalEntity) => void
}

const ENTITY_LABELS: Record<GoalLinkEntityType, string> = {
  project: 'proyecto',
  habit: 'habito',
  routine: 'rutina',
  note: 'nota',
}

export function AddToGoalModal({
  goalId,
  entityType,
  linkedIds,
  onLinked,
}: AddToGoalModalProps) {
  const [open, setOpen] = useState(false)
  const [entities, setEntities] = useState<LinkableGoalEntity[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return

    let active = true
    const loadEntities = async () => {
      setLoading(true)
      setError(null)

      const result = await getLinkableEntities(entityType)
      if (!active) return

      if (result.error) {
        setEntities([])
        setError(result.error)
      } else {
        setEntities(result.data ?? [])
      }

      setLoading(false)
    }

    void loadEntities()

    return () => {
      active = false
    }
  }, [entityType, open])

  const availableEntities = useMemo(
    () => entities.filter((entity) => !linkedIds.includes(entity.id)),
    [entities, linkedIds],
  )

  async function handleLinkEntity(entity: LinkableGoalEntity) {
    const result = await linkEntityToGoal(goalId, entityType, entity.id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    onLinked(entity)
    setSelectedId('')
    setOpen(false)
    toast.success(`${ENTITY_LABELS[entityType]} vinculado`)
  }

  function handleCreateAndLink() {
    const title = newTitle.trim()
    if (!title) {
      toast.error(`Ingresa un ${ENTITY_LABELS[entityType]}`)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      let createdEntity: LinkableGoalEntity | null = null

      if (entityType === 'project') {
        formData.set('title', title)
        const result = await createProjectAction(formData)
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        if ('project' in result && result.project) {
          createdEntity = {
            id: result.project.id,
            title: result.project.title,
            description: result.project.description,
          }
        }
      }

      if (entityType === 'habit') {
        formData.set('name', title)
        const result = await createHabitAction(formData)
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        if ('habit' in result && result.habit) {
          createdEntity = {
            id: result.habit.id,
            title: result.habit.name,
            description: result.habit.description,
          }
        }
      }

      if (entityType === 'routine') {
        formData.set('name', title)
        const result = await createRoutineAction(formData)
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        if ('routine' in result && result.routine) {
          createdEntity = {
            id: result.routine.id,
            title: result.routine.name,
            description: result.routine.description,
          }
        }
      }

      if (entityType === 'note') {
        formData.set('title', title)
        const result = await createNoteAction(formData)
        if ('error' in result && result.error) {
          toast.error(result.error)
          return
        }
        if ('note' in result && result.note) {
          createdEntity = {
            id: result.note.id,
            title: result.note.title,
            description: result.note.excerpt,
          }
        }
      }

      if (!createdEntity) {
        toast.error('No se pudo crear la entidad')
        return
      }

      const linkResult = await linkEntityToGoal(goalId, entityType, createdEntity.id)
      if (!linkResult.ok) {
        toast.error(linkResult.error)
        return
      }

      onLinked(createdEntity)
      setEntities((current) => [createdEntity!, ...current])
      setNewTitle('')
      setOpen(false)
      toast.success(`${ENTITY_LABELS[entityType]} creado y vinculado`)
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-border-bright hover:text-foreground"
      >
        <Plus size={13} />
        Agregar {ENTITY_LABELS[entityType]}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-80 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-text">Vincular {ENTITY_LABELS[entityType]}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mb-3 flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`Nuevo ${ENTITY_LABELS[entityType]}`}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent-600"
            />
            <button
              type="button"
              onClick={handleCreateAndLink}
              disabled={isPending}
              className="rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Crear'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted">
              <Loader2 size={13} className="animate-spin" />
              Cargando...
            </div>
          ) : error ? (
            <p className="py-3 text-xs text-red-500">{error}</p>
          ) : availableEntities.length === 0 ? (
            <p className="py-3 text-xs text-muted">No hay entidades disponibles.</p>
          ) : (
            <>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent-600"
              >
                <option value="">Selecciona una opción</option>
                {availableEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!selectedId}
                onClick={() => {
                  const entity = availableEntities.find((item) => item.id === selectedId)
                  if (entity) void handleLinkEntity(entity)
                }}
                className="mt-3 w-full rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Vincular
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
