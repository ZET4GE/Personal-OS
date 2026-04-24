'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Edit3, EyeOff, Eye, Loader2, Move, RotateCcw } from 'lucide-react'
import { useDashboardConfig } from '@/hooks/useDashboardConfig'
import type { DashboardWidgetLayout, DashboardWidgetSize } from '@/types/dashboard-config'

interface DashboardWidgetSlot {
  id: string
  type: string
  title: string
  defaultSize: DashboardWidgetSize
  defaultVisible?: boolean
  content: React.ReactNode
}

interface DashboardCustomizerProps {
  widgets: DashboardWidgetSlot[]
}

const SIZE_CLASS: Record<DashboardWidgetSize, string> = {
  sm: 'xl:col-span-1',
  md: 'xl:col-span-2',
  lg: 'xl:col-span-3',
  xl: 'xl:col-span-4',
}

const ALL_SIZES: DashboardWidgetSize[] = ['sm', 'md', 'lg', 'xl']

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
  onResize: (id: string, size: DashboardWidgetSize) => void
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
    transition: transition ?? 'transform 180ms ease, opacity 180ms ease',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'col-span-1',
        SIZE_CLASS[layout.size],
        editMode ? 'transition-all duration-150 hover:scale-[1.005]' : '',
        isDragging ? 'z-50 opacity-80 shadow-2xl' : '',
      ].join(' ')}
    >
      <div
        className={[
          'h-full',
          editMode ? 'rounded-2xl border border-dashed border-accent-600/50 p-1.5 shadow-lg' : '',
        ].join(' ')}
      >
        {editMode && (
          <div className="mb-1.5 flex items-center justify-between rounded-xl bg-surface-2 px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground active:cursor-grabbing"
                title="Mover"
              >
                <Move size={13} />
              </button>
              <p className="truncate text-xs font-semibold text-text">{widget.title}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
                {ALL_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onResize(widget.id, s)}
                    className={[
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase transition-colors',
                      layout.size === s
                        ? 'bg-accent-600 text-white'
                        : 'text-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onToggleVisible(widget.id)}
                className="rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                title="Ocultar"
              >
                <EyeOff size={13} />
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function WidgetGhost({
  title,
  size,
}: {
  title: string
  size: DashboardWidgetSize
}) {
  return (
    <div
      className={[
        'min-w-[220px] rounded-2xl border-2 border-dashed border-accent-600/60 bg-surface p-3 shadow-2xl',
        size === 'xl' ? 'w-[min(960px,85vw)]' : size === 'lg' ? 'w-[min(720px,80vw)]' : size === 'md' ? 'w-[min(480px,70vw)]' : 'w-[min(320px,60vw)]',
      ].join(' ')}
    >
      <div className="rounded-xl bg-surface-2 px-3 py-2">
        <p className="text-xs font-semibold text-text">{title}</p>
        <p className="text-[11px] uppercase tracking-wide text-muted">{size}</p>
      </div>
    </div>
  )
}

export function DashboardCustomizer({ widgets }: DashboardCustomizerProps) {
  const [editMode, setEditMode] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const defaultLayout = useMemo<DashboardWidgetLayout[]>(
    () =>
      widgets.map((widget, index) => ({
        id: widget.id,
        type: widget.type,
        visible: widget.defaultVisible ?? true,
        size: widget.defaultSize,
        position: index,
      })),
    [widgets],
  )
  const { layout, loading, saving, error, setLayout } = useDashboardConfig(defaultLayout)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2 } }))
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
  const hiddenWidgets = useMemo(
    () =>
      widgets
        .map((widget) => ({
          widget,
          layout: layoutMap.get(widget.id),
        }))
        .filter((item): item is { widget: DashboardWidgetSlot; layout: DashboardWidgetLayout } => Boolean(item.layout))
        .filter((item) => !item.layout.visible)
        .sort((a, b) => a.layout.position - b.layout.position),
    [layoutMap, widgets],
  )
  const activeWidget = useMemo(
    () => widgets.find((widget) => widget.id === activeId) ?? null,
    [activeId, widgets],
  )
  const activeLayout = activeId ? layoutMap.get(activeId) ?? null : null

  function updatePositions(nextLayout: DashboardWidgetLayout[]) {
    setLayout(
      nextLayout.map((item, index) => ({
        ...item,
        position: index,
      })),
    )
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = layout.findIndex((item) => item.id === active.id)
    const newIndex = layout.findIndex((item) => item.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    updatePositions(arrayMove(layout, oldIndex, newIndex))
  }

  function handleDragCancel() {
    setActiveId(null)
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

  function handleResize(id: string, size: DashboardWidgetSize) {
    setLayout((current) =>
      current.map((item) =>
        item.id === id ? { ...item, size } : item,
      ),
    )
  }

  function handleShowWidget(id: string) {
    setLayout((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, visible: true }
          : item,
      ),
    )
  }

  function handleResetCompactLayout() {
    setLayout(defaultLayout)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text">Dashboard</h2>
          <p className="text-xs text-muted">
            {editMode ? 'Arrastrá, redimensioná u ocultá widgets' : 'Vista personalizada'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Loader2 size={11} className="animate-spin" />
              Guardando…
            </span>
          )}
          {!saving && !loading && !editMode && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Check size={11} />
              Guardado
            </span>
          )}
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
            {editMode ? <Check size={15} /> : <Edit3 size={15} />}
            {editMode ? 'Listo' : 'Editar'}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleResetCompactLayout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-text"
          >
            <RotateCcw size={12} />
            Restablecer layout
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {editMode && hiddenWidgets.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Widgets ocultos</p>
              <p className="text-xs text-muted">Puedes restaurarlos cuando quieras.</p>
            </div>
            <span className="rounded-full bg-surface-2 px-2 py-1 text-xs text-muted">
              {hiddenWidgets.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map(({ widget }) => (
              <button
                key={widget.id}
                type="button"
                onClick={() => handleShowWidget(widget.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted transition-all hover:border-border-bright hover:text-foreground hover:shadow-sm"
              >
                <Eye size={14} />
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={orderedVisibleWidgets.map((item) => item.widget.id)} strategy={rectSortingStrategy}>
          <div
            className={[
              'grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4',
              editMode ? 'transition-all duration-200 ease-out' : '',
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
        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
          {activeWidget && activeLayout ? (
            <WidgetGhost title={activeWidget.title} size={activeLayout.size} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
