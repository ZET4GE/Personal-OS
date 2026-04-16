'use client'

import { useState } from 'react'
import dagre from 'dagre'
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowProps,
} from '@xyflow/react'
import { createClient } from '@/lib/supabase/client'
import '@xyflow/react/dist/style.css'
import type { LearningRoadmapNode, LearningRoadmapType } from '@/types/roadmaps'

type RoadmapFlowNodeData = {
  label: string
  progress: number
  node: LearningRoadmapNode
  isActive: boolean
  section: string
}

const NODE_WIDTH = 240
const NODE_HEIGHT = 118

function getProgressColor(progress: number) {
  if (progress < 30) return 'border-red-500/40 bg-red-500/10 text-red-200'
  if (progress < 70) return 'border-amber-500/40 bg-amber-500/10 text-amber-100'
  return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
}

function getProgressBar(progress: number) {
  if (progress < 30) return 'bg-red-500'
  if (progress < 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getSectionLabel(node: LearningRoadmapNode, roadmapType: LearningRoadmapType) {
  if (roadmapType !== 'free' && node.level) return node.level
  if (node.type === 'skill') return 'Avanzado'
  return 'Fundamentos'
}

function getActiveNode(nodes: LearningRoadmapNode[]) {
  return nodes.find((node) => node.progress > 0 && node.progress < 1)
    ?? nodes.find((node) => node.progress < 1)
    ?? nodes.at(-1)
    ?? null
}

function getActivePath(edgeList: Edge[], activeNodeId: string | null) {
  if (!activeNodeId) return new Set<string>()

  const activeEdgeIds = new Set<string>()
  let cursor = activeNodeId

  while (cursor) {
    const edge = edgeList.find((item) => item.target === cursor)
    if (!edge) break

    activeEdgeIds.add(edge.id)
    cursor = edge.source
  }

  return activeEdgeIds
}

function getLayoutedNodes(
  flowNodes: Node<RoadmapFlowNodeData>[],
  flowEdges: Edge[],
  roadmapType: LearningRoadmapType,
) {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: roadmapType === 'free' ? 'LR' : 'TB',
    align: 'UL',
    nodesep: roadmapType === 'free' ? 100 : 80,
    ranksep: roadmapType === 'free' ? 120 : 110,
    marginx: 40,
    marginy: 40,
  })

  flowNodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  flowEdges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  return flowNodes.map((node) => {
    const position = graph.node(node.id)

    return {
      ...node,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    }
  })
}

function RoadmapNode({ data, selected }: NodeProps<Node<RoadmapFlowNodeData>>) {
  const progress = Math.round(data.progress)

  return (
    <div
      className={[
        'w-[240px] rounded-2xl border px-4 py-3 shadow-xl backdrop-blur transition-all duration-200',
        'hover:scale-[1.03] hover:shadow-cyan-500/20',
        data.isActive ? 'scale-105 ring-2 ring-cyan-400/80 shadow-cyan-500/20' : '',
        selected ? 'ring-2 ring-cyan-400/70' : '',
        getProgressColor(progress),
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!border-cyan-400 !bg-surface" />
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
          {data.section}
        </span>
        {data.isActive ? (
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Actual
          </span>
        ) : null}
      </div>
      <p className="text-sm font-semibold leading-snug">{data.label}</p>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all ${getProgressBar(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-cyan-400 !bg-surface" />
    </div>
  )
}

const nodeTypes = {
  roadmapNode: RoadmapNode,
}

interface LearningRoadmapFlowProps {
  nodes: LearningRoadmapNode[]
  roadmapType: LearningRoadmapType
  onNodesChange?: (nodes: LearningRoadmapNode[]) => void
}

export function LearningRoadmapFlow({ nodes, roadmapType, onNodesChange }: LearningRoadmapFlowProps) {
  const [selectedNode, setSelectedNode] = useState<LearningRoadmapNode | null>(null)
  const supabase = createClient()
  const activeNode = getActiveNode(nodes)

  const parentEdges = nodes
    .filter((node) => Boolean(node.parent_id))
    .map((node) => ({
      id: `${node.parent_id}-${node.id}`,
      source: String(node.parent_id),
      target: node.id,
    }))

  const rawEdges = parentEdges
  const activePath = getActivePath(rawEdges, activeNode?.id ?? null)

  const flowEdges: Edge[] = rawEdges.map((edge) => {
    const isActive = activePath.has(edge.id)

    return {
      ...edge,
      animated: isActive,
      type: 'smoothstep',
      style: {
        stroke: isActive ? '#22d3ee' : '#64748b',
        strokeWidth: isActive ? 3 : 1.5,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: isActive ? '#22d3ee' : '#64748b',
      },
    }
  })

  const baseNodes: Node<RoadmapFlowNodeData>[] = nodes.map((node, index) => ({
    id: node.id,
    type: 'roadmapNode',
    data: {
      label: node.title,
      progress: Math.round(node.progress * 100),
      node,
      isActive: roadmapType !== 'free' && node.id === activeNode?.id,
      section: getSectionLabel(node, roadmapType),
    },
    position: {
      x: node.position_x ?? (index % 3) * 300,
      y: node.position_y ?? Math.floor(index / 3) * 180,
    },
  }))

  const flowNodes = roadmapType === 'free'
    ? baseNodes
    : getLayoutedNodes(baseNodes, flowEdges, roadmapType)

  const sections = Array.from(new Set(nodes.map((node) => getSectionLabel(node, roadmapType))))

  const handleNodeDragStop: NonNullable<ReactFlowProps<Node<RoadmapFlowNodeData>>['onNodeDragStop']> = async (_, node) => {
    if (roadmapType !== 'free') return

    const x = Math.round(node.position.x)
    const y = Math.round(node.position.y)

    onNodesChange?.(
      nodes.map((item) =>
        item.id === node.id
          ? { ...item, position_x: x, position_y: y }
          : item,
      ),
    )

    await supabase
      .from('learning_nodes')
      .update({ position_x: x, position_y: y })
      .eq('id', node.id)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-text">Mapa visual</h2>
          <p className="text-xs text-muted">
            {roadmapType === 'free'
              ? 'Modo libre con zoom, pan y nodos arrastrables'
              : roadmapType === 'structured'
              ? 'Plan por niveles. Las conexiones son prerequisitos manuales.'
              : 'Plan por niveles con progreso conectado a metas y prerequisitos manuales.'}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {sections.map((section) => (
            <span
              key={section}
              className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted"
            >
              {section}
            </span>
          ))}
          {selectedNode ? (
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
              {selectedNode.title}
            </span>
          ) : null}
        </div>
      </div>

      <div className="h-[620px] bg-[radial-gradient(circle_at_top,#0b1220_0%,#050507_55%)]">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          onNodeClick={(_, node) => setSelectedNode(node.data.node)}
          onNodeDragStop={handleNodeDragStop}
        >
          <Background color="#334155" gap={20} />
          <Controls className="!border-border !bg-surface !text-text" />
        </ReactFlow>
      </div>

      {selectedNode ? (
        <div className="border-t border-border bg-surface-2 px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-text">{selectedNode.title}</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                {selectedNode.description || 'Sin descripcion'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNode.goals.length > 0 ? (
                selectedNode.goals.map((goal) => (
                  <span
                    key={goal.id}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text"
                  >
                    {goal.title} · {Math.round(goal.progress)}%
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted">Sin metas conectadas</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
