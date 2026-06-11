'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface MemoryNode {
  id: number
  type: string
  label: string
  importance: number
  parent_id?: number | null
}

interface Props {
  nodes: MemoryNode[]
  width?: number
  height?: number
  onNodeSelect?: (node: MemoryNode | null) => void
}

const TYPE_COLORS: Record<string, { fill: string; stroke: string; glow: string }> = {
  person:     { fill: '#818cf8', stroke: '#6366f1', glow: '#6366f155' },
  event:      { fill: '#fbbf24', stroke: '#f59e0b', glow: '#f59e0b55' },
  preference: { fill: '#34d399', stroke: '#10b981', glow: '#10b98155' },
  skill:      { fill: '#60a5fa', stroke: '#3b82f6', glow: '#3b82f655' },
  habit:      { fill: '#a78bfa', stroke: '#8b5cf6', glow: '#8b5cf655' },
  project:    { fill: '#f87171', stroke: '#ef4444', glow: '#ef444455' },
  default:    { fill: '#94a3b8', stroke: '#64748b', glow: '#64748b55' },
}

const TYPE_LABELS: Record<string, string> = {
  person: 'Persona', event: 'Evento', preference: 'Preferencia',
  skill: 'Habilidad', habit: 'Hábito', project: 'Proyecto',
}

function layoutNodes(nodes: MemoryNode[], w: number, h: number) {
  const cx = w / 2, cy = h / 2
  const byType: Record<string, MemoryNode[]> = {}
  nodes.forEach(n => { (byType[n.type] ??= []).push(n) })

  const typeKeys = Object.keys(byType)
  const result: (MemoryNode & { x: number; y: number; r: number })[] = []

  typeKeys.forEach((type, ti) => {
    const typeNodes = byType[type]
    const clusterAngle = (ti / typeKeys.length) * Math.PI * 2
    const clusterR = Math.min(w, h) * 0.28
    const clusterCx = cx + Math.cos(clusterAngle) * clusterR
    const clusterCy = cy + Math.sin(clusterAngle) * clusterR

    typeNodes.forEach((n, ni) => {
      const angle = (ni / typeNodes.length) * Math.PI * 2
      const spread = Math.min(w, h) * 0.1
      result.push({
        ...n,
        x: clusterCx + Math.cos(angle) * spread * (typeNodes.length > 1 ? 1 : 0),
        y: clusterCy + Math.sin(angle) * spread * (typeNodes.length > 1 ? 1 : 0),
        r: 5 + n.importance * 10,
      })
    })
  })
  return result
}

export default function NeuralBrainGraph({ nodes, width = 800, height = 460, onNodeSelect }: Props) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(TYPE_LABELS)))
  const svgRef = useRef<SVGSVGElement>(null)

  const laid = useMemo(() => layoutNodes(nodes, width, height), [nodes, width, height])

  const filteredLaid = useMemo(() =>
    laid.filter(n => activeFilters.has(n.type)),
    [laid, activeFilters]
  )

  const edges = useMemo(() => {
    const result: [number, number][] = []
    const filteredIds = new Set(filteredLaid.map(n => n.id))
    const indexMap = new Map(filteredLaid.map((n, i) => [n.id, i]))

    // parent-child edges
    filteredLaid.forEach((n) => {
      if (n.parent_id != null && filteredIds.has(n.parent_id)) {
        const pi = indexMap.get(n.parent_id)
        const ci = indexMap.get(n.id)
        if (pi !== undefined && ci !== undefined) result.push([pi, ci])
      }
    })

    // same-type nearest neighbor edges
    const byType: Record<string, number[]> = {}
    filteredLaid.forEach((n, i) => { (byType[n.type] ??= []).push(i) })
    Object.values(byType).forEach(idxs => {
      for (let i = 0; i < idxs.length - 1; i++) result.push([idxs[i], idxs[i + 1]])
    })
    return result.slice(0, 60)
  }, [filteredLaid])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.5, Math.min(3, z * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleFilter = (type: string) => {
    const newFilters = new Set(activeFilters)
    if (newFilters.has(type)) {
      newFilters.delete(type)
    } else {
      newFilters.add(type)
    }
    setActiveFilters(newFilters)
  }

  const handleNodeClick = (node: MemoryNode) => {
    setSelectedNode(node)
    onNodeSelect?.(node)
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-indigo-500/20 bg-slate-950" style={{ width: '100%', height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-slate-400 text-sm">Sin memorias aún</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden border border-indigo-500/20 bg-slate-950">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-indigo-500/20 bg-slate-900/50">
        {Object.entries(TYPE_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeFilters.has(type)
                ? 'bg-indigo-500/30 border border-indigo-400 text-indigo-300'
                : 'bg-slate-700/30 border border-slate-600 text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG con zoom/pan */}
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height, background: '#020817' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: `${width / 2}px ${height / 2}px`,
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.07)" strokeWidth="0.5"/>
          </pattern>
          {/* Glow filters */}
          {Object.entries(TYPE_COLORS).map(([type, c]) => (
            <filter key={type} id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={c.stroke} floodOpacity="0.6" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          ))}
        </defs>

        {/* Background grid */}
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges */}
        {edges.map(([ai, bi], i) => {
          const a = filteredLaid[ai], b = filteredLaid[bi]
          if (!a || !b) return null
          const c = TYPE_COLORS[a.type] ?? TYPE_COLORS.default
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={c.stroke} strokeWidth="0.8" strokeOpacity="0.3"
              strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" values="8;0" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            </line>
          )
        })}

        {/* Nodes */}
        {filteredLaid.map((n, i) => {
          const c = TYPE_COLORS[n.type] ?? TYPE_COLORS.default
          const duration = `${3 + (i % 4)}s`
          const delay = `${(i * 0.3) % 2}s`
          const maxLabelLen = Math.floor(n.r * 2.2 / 6)
          const label = n.label.length > maxLabelLen ? n.label.slice(0, maxLabelLen - 1) + '…' : n.label

          const isSelected = selectedNode?.id === n.id
          return (
            <g
              key={n.id}
              filter={`url(#glow-${n.type ?? 'default'})`}
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(n)
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r + 4}
                fill="none"
                stroke={isSelected ? '#fbbf24' : c.stroke}
                strokeWidth={isSelected ? 2.5 : 1}
                strokeOpacity={isSelected ? 1 : 0.4}
              >
                <animate attributeName="r" values={`${n.r + 2};${n.r + 8};${n.r + 2}`} dur={duration} begin={delay} repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values={isSelected ? '1;1;1' : '0.4;0;0.4'} dur={duration} begin={delay} repeatCount="indefinite" />
              </circle>
              {/* Node body */}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill={isSelected ? '#fbbf24' : c.fill}
                fillOpacity={isSelected ? 0.95 : 0.85}
                stroke={isSelected ? '#f59e0b' : c.stroke}
                strokeWidth={isSelected ? 2 : 1.5}
              >
                <animate attributeName="r" values={`${n.r};${n.r * 1.05};${n.r}`} dur={duration} begin={delay} repeatCount="indefinite" />
              </circle>
              {/* Label */}
              {n.r > 7 && (
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isSelected ? '#1f2937' : 'white'}
                  fontSize={Math.max(8, Math.min(11, n.r))}
                  fontWeight={isSelected ? 700 : 500}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {label}
                </text>
              )}
              <title>{n.label} ({TYPE_LABELS[n.type] ?? n.type}) — importancia: {n.importance.toFixed(1)}</title>
            </g>
          )
        })}

        {/* Legend */}
        <g>
          <rect x={width - 160} y={10} width={150} height={140} fill="rgba(15,23,42,0.9)" stroke="rgba(100,116,139,0.5)" strokeWidth="1" rx="8" />
          {Object.entries(TYPE_COLORS)
            .filter(([k]) => k !== 'default')
            .map(([type, c], idx) => (
              <g key={type}>
                <circle cx={width - 150} cy={30 + idx * 20} r="2.5" fill={c.fill} />
                <text
                  x={width - 140}
                  y={30 + idx * 20 + 3}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  {TYPE_LABELS[type] ?? type}
                </text>
              </g>
            ))}
        </g>

        {/* Node counter */}
        <rect x={10} y={height - 30} width={140} height={24} fill="rgba(79,70,229,0.2)" stroke="rgba(79,70,229,0.3)" strokeWidth="1" rx="4" />
        <text x={20} y={height - 12} fill="#a5b4fc" fontSize="12" fontFamily="monospace" fontWeight="600">
          {`${filteredLaid.length} nodos${activeFilters.size < Object.keys(TYPE_LABELS).length ? ` (${activeFilters.size} filtros)` : ''}`}
        </text>
        </svg>
      </div>

      {/* Info panel */}
      {selectedNode && (
        <div className="border-t border-indigo-500/20 bg-slate-900/50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: (TYPE_COLORS[selectedNode.type] ?? TYPE_COLORS.default).fill }}
                />
                <h3 className="text-sm font-semibold text-white">{selectedNode.label}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Tipo: <span className="text-slate-300">{TYPE_LABELS[selectedNode.type] ?? selectedNode.type}</span>
              </p>
              <p className="text-xs text-slate-400">
                Importancia: <span className="text-slate-300">{(selectedNode.importance * 100).toFixed(0)}%</span>
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedNode(null)
                onNodeSelect?.(null)
              }}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
