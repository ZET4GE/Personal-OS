'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Edit3, EyeOff, Move, Scaling, Save } from 'lucide-react'
import { useDashboardConfig } from '@/hooks/useDashboardConfig'
import type { DashboardWidgetLayout, DashboardWidgetSize } from '@/types/dashboard-config'

interface DashboardWidgetSlot {
  id: string
  type: string
  title: string
  defaultSize: DashboardWidgetSize
  content: React.ReactNode
}

interface DashboardCustomizerProps {
  widgets: DashboardWidgetSlot[]
}

const SIZE_CLASS: Record<DashboardWidgetSize, string> = {
  sm: 'lg:col-span-1',
  md: 'lg:col-span-2',
  lg: 'lg:col-span-3',
}

function cycleSize(size: DashboardWidgetSize): DashboardWidgetSize {
  if (size === 'sm') return 'md'
  if (size === 'md') return 'lg'
  return 'sm'
}

function SortableWidget({
  widget,
  layout,
  editMode,
  onToggleVisible,
  onResize,
  children,
}: {
  widget: DashboardWidgetSlot
  layout: DashboardWidgetLayout
  editMode: boolean
  onToggleVisible: (id: string) => void
  onResize: (id: string) => void
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'col-span-1',
        SIZE_CLASS[layout.size],
        editMode ? 'transition-transform duration-200 hover:scale-[1.02]' : '',
        isDragging ? 'z-50 opacity-80 shadow-2xl' : '',
      ].join(' ')}
    >
      <div
        className={[
          'h-full',
          editMode ? 'rounded-2xl border-2 border-dashed border-accent-600/50 p-2 shadow-lg' : '',
        ].join(' ')}
      >
        {editMode && (
          <div className="mb-2 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-text">{widget.title}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">{layout.size}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                title="Mover"
              >
                <Move size={14} />
              </button>
              <button
                type="button"
                onClick={() => onResize(widget.id)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                title="Redimensionar"
              >
                <Scaling size={14} />
              </button>
              <button
                type="button"
                onClick={() => onToggleVisible(widget.id)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                title="Ocultar"
              >
                <EyeOff size={14} />
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function DashboardCustomizer({ widgets }: DashboardCustomizerProps) {
  const [editMode, setEditMode] = useState(false)
  const defaultLayout = useMemo<DashboardWidgetLayout[]>(
    () =>
      widgets.map((widget, index) => ({
        id: widget.id,
        type: widget.type,
        visible: true,
        size: widget.defaultSize,
        position: index,
      })),
    [widgets],
  )
  const { layout, loading, error, setLayout } = useDashboardConfig(defaultLayout)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const layoutMap = useMemo(() => new Map(layout.map((item) => [item.id, item])), [layout])
  const orderedVisibleWidgets = useMemo(
    () =>
      widgets
        .map((widget) => ({
          widget,
          layout: layoutMap.get(widget.id),
        }))
        .filter((item): item is { widget: DashboardWidgetSlot; layout: DashboardWidgetLayout } => Boolean(item.layout))
        .sort((a, b) => a.layout.position - b.layout.position)
        .filter((item) => item.layout.visible),
    [layoutMap, widgets],
  )

  function updatePositions(nextLayout: DashboardWidgetLayout[]) {
    setLayout(
      nextLayout.map((item, index) => ({
        ...item,
        position: index,
      })),
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = layout.findIndex((item) => item.id === active.id)
    const newIndex = layout.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    updatePositions(arrayMove(layout, oldIndex, newIndex))
  }

  function handleToggleVisible(id: string) {
    setLayout((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, visible: !item.visible }
          : item,
      ),
    )
  }

  function handleResize(id: string) {
    setLayout((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, size: cycleSize(item.size) }
          : item,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text">Dashboard</h2>
          <p className="text-xs text-muted">
            {editMode ? 'Modo edición activo' : 'Vista personalizada'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditMode((current) => !current)}
          className={[
            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all',
            editMode
              ? 'border-accent-600 bg-accent-600/10 text-accent-600 scale-[1.02]'
              : 'border-border bg-surface text-muted hover:border-border-bright hover:text-foreground',
          ].join(' ')}
        >
          {editMode ? <Save size={15} /> : <Edit3 size={15} />}
          {editMode ? 'Guardar dashboard' : 'Editar dashboard'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedVisibleWidgets.map((item) => item.widget.id)} strategy={rectSortingStrategy}>
          <div
            className={[
              'grid grid-cols-1 gap-6 lg:grid-cols-3',
              editMode ? 'transition-transform duration-200' : '',
              editMode ? 'scale-[1.02]' : '',
              loading ? 'opacity-70' : '',
            ].join(' ')}
          >
            {orderedVisibleWidgets.map(({ widget, layout: widgetLayout }) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                layout={widgetLayout}
                editMode={editMode}
                onToggleVisible={handleToggleVisible}
                onResize={handleResize}
              >
                {widget.content}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
