'use client'

import { useState } from 'react'
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { LearningRoadmapNode } from '@/types/roadmaps'

type RoadmapFlowNodeData = {
  label: string
  progress: number
  node: LearningRoadmapNode
}

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

function RoadmapNode({ data, selected }: NodeProps<Node<RoadmapFlowNodeData>>) {
  const progress = Math.round(data.progress)

  return (
    <div
      className={[
        'min-w-48 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur transition-all duration-200',
        'hover:scale-[1.03] hover:shadow-cyan-500/10',
        selected ? 'ring-2 ring-cyan-400/70' : '',
        getProgressColor(progress),
      ].join(' ')}
    >
      <Handle type="target" position={Position.Top} className="!border-cyan-400 !bg-surface" />
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
}

export function LearningRoadmapFlow({ nodes }: LearningRoadmapFlowProps) {
  const [selectedNode, setSelectedNode] = useState<LearningRoadmapNode | null>(null)

  const flowNodes: Node<RoadmapFlowNodeData>[] = nodes.map((node, index) => ({
    id: node.id,
    type: 'roadmapNode',
    data: {
      label: node.title,
      progress: Math.round(node.progress * 100),
      node,
    },
    position: {
      x: (index % 3) * 280,
      y: Math.floor(index / 3) * 190,
    },
  }))

  const parentEdges: Edge[] = nodes
    .filter((node) => Boolean(node.parent_id))
    .map((node) => ({
      id: `${node.parent_id}-${node.id}`,
      source: String(node.parent_id),
      target: node.id,
      animated: true,
      className: 'stroke-cyan-400',
    }))

  const fallbackEdges: Edge[] = nodes.slice(1).map((node, index) => ({
    id: `${nodes[index].id}-${node.id}`,
    source: nodes[index].id,
    target: node.id,
    animated: true,
    className: 'stroke-cyan-400',
  }))

  const flowEdges = parentEdges.length > 0 ? parentEdges : fallbackEdges

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-text">Mapa visual</h2>
          <p className="text-xs text-muted">Zoom, pan y nodos arrastrables</p>
        </div>
        {selectedNode ? (
          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
            {selectedNode.title}
          </span>
        ) : null}
      </div>

      <div className="h-[520px] bg-[radial-gradient(circle_at_top,#0b1220_0%,#050507_55%)]">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          onNodeClick={(_, node) => setSelectedNode(node.data.node)}
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
