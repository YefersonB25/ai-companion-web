'use client'

import { useMemo } from 'react'

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

export default function NeuralBrainGraph({ nodes, width = 800, height = 460 }: Props) {
  const laid = useMemo(() => layoutNodes(nodes, width, height), [nodes, width, height])

  const edges = useMemo(() => {
    const result: [number, number][] = []
    // parent-child edges
    laid.forEach((n, i) => {
      if (n.parent_id != null) {
        const pi = laid.findIndex(p => p.id === n.parent_id)
        if (pi >= 0) result.push([pi, i])
      }
    })
    // same-type nearest neighbor edges (max 1 per node)
    const byType: Record<string, number[]> = {}
    laid.forEach((n, i) => { (byType[n.type] ??= []).push(i) })
    Object.values(byType).forEach(idxs => {
      for (let i = 0; i < idxs.length - 1; i++) result.push([idxs[i], idxs[i + 1]])
    })
    return result.slice(0, 60) // cap edges
  }, [laid])

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
    <div className="relative w-full rounded-xl overflow-hidden border border-indigo-500/20" style={{ height, background: '#020817' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
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
          const a = laid[ai], b = laid[bi]
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
        {laid.map((n, i) => {
          const c = TYPE_COLORS[n.type] ?? TYPE_COLORS.default
          const duration = `${3 + (i % 4)}s`
          const delay = `${(i * 0.3) % 2}s`
          const maxLabelLen = Math.floor(n.r * 2.2 / 6)
          const label = n.label.length > maxLabelLen ? n.label.slice(0, maxLabelLen - 1) + '…' : n.label

          return (
            <g key={n.id} filter={`url(#glow-${n.type ?? 'default'})`}>
              {/* Pulse ring */}
              <circle cx={n.x} cy={n.y} r={n.r + 4} fill="none" stroke={c.stroke} strokeWidth="1" strokeOpacity="0.4">
                <animate attributeName="r" values={`${n.r + 2};${n.r + 8};${n.r + 2}`} dur={duration} begin={delay} repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur={duration} begin={delay} repeatCount="indefinite" />
              </circle>
              {/* Node body */}
              <circle cx={n.x} cy={n.y} r={n.r} fill={c.fill} fillOpacity="0.85" stroke={c.stroke} strokeWidth="1.5">
                <animate attributeName="r" values={`${n.r};${n.r * 1.05};${n.r}`} dur={duration} begin={delay} repeatCount="indefinite" />
              </circle>
              {/* Label */}
              {n.r > 7 && (
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize={Math.max(8, Math.min(11, n.r))} fontWeight="500"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {label}
                </text>
              )}
              {/* Tooltip on hover - type label below */}
              <title>{n.label} ({TYPE_LABELS[n.type] ?? n.type}) — importancia: {n.importance.toFixed(1)}</title>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-700/50">
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'default').map(([type, c]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.fill }} />
            <span className="text-[10px] text-slate-300">{TYPE_LABELS[type] ?? type}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1">
        <span className="text-indigo-300 text-xs font-mono">{nodes.length} nodos</span>
      </div>
    </div>
  )
}
