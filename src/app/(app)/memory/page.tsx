'use client'

import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import api from '@/lib/api'
import { MindMapData } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRealtimeMemory } from '@/hooks/useRealtimeMemory'

const TYPE_COLORS: Record<string, string> = {
  person:     '#6366f1',
  project:    '#0ea5e9',
  habit:      '#22c55e',
  preference: '#f59e0b',
  event:      '#ec4899',
  skill:      '#8b5cf6',
  note:       '#64748b',
}

export default function MemoryPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data }: { data: MindMapData } = await api.get('/memory/mindmap')

      const rfNodes: Node[] = data.nodes.map((n, i) => ({
        id: String(n.id),
        data: { label: n.label, type: n.type, importance: n.importance },
        position: {
          x: 100 + (i % 5) * 200,
          y: 100 + Math.floor(i / 5) * 150,
        },
        style: {
          background: TYPE_COLORS[n.type] ?? '#64748b',
          color: '#fff',
          borderRadius: '12px',
          border: 'none',
          padding: '8px 14px',
          fontSize: '13px',
          fontWeight: '500',
          opacity: 0.6 + n.importance * 0.4,
        },
      }))

      const rfEdges: Edge[] = data.edges.map((e) => ({
        id: `${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        style: { stroke: '#94a3b8', strokeWidth: 1.5 },
        animated: false,
      }))

      setNodes(rfNodes)
      setEdges(rfEdges)
    } finally {
      setIsLoading(false)
    }
  }, [setNodes, setEdges])

  useEffect(() => { load() }, [load])

  useRealtimeMemory(useCallback((node) => {
    setNodes((prev) => {
      if (prev.find((n) => n.id === String(node.id))) return prev
      const i = prev.length
      return [...prev, {
        id: String(node.id),
        data: { label: node.label, type: node.type, importance: node.importance },
        position: { x: 100 + (i % 5) * 200, y: 100 + Math.floor(i / 5) * 150 },
        style: {
          background: TYPE_COLORS[node.type] ?? '#64748b',
          color: '#fff',
          borderRadius: '12px',
          border: 'none',
          padding: '8px 14px',
          fontSize: '13px',
          fontWeight: '500',
          opacity: 0.6 + node.importance * 0.4,
        },
      }]
    })
  }, [setNodes]))

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Mapa Mental</h1>
          <p className="text-sm text-muted-foreground">
            Visualización de tu memoria personal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <Badge key={type} style={{ background: color, color: '#fff', border: 'none' }} className="text-[10px]">
                {type}
              </Badge>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Mind map canvas */}
      <div className="flex-1">
        {nodes.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Aún no hay nodos de memoria. Empieza a chatear para que tu asistente te conozca.
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#94a3b8" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => (n.style?.background as string) ?? '#64748b'}
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
