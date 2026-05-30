'use client'

import { useEffect, useRef, useCallback } from 'react'

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

const TYPE_COLORS: Record<string, string> = {
  person:     '#818cf8', // indigo
  event:      '#fbbf24', // amber
  preference: '#34d399', // emerald
  skill:      '#60a5fa', // blue
  habit:      '#a78bfa', // violet
  project:    '#f87171', // red
  default:    '#94a3b8', // slate
}

const TYPE_LABELS: Record<string, string> = {
  person:     'Persona',
  event:      'Evento',
  preference: 'Preferencia',
  skill:      'Habilidad',
  habit:      'Hábito',
  project:    'Proyecto',
}

interface PhysicsNode extends MemoryNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export default function NeuralBrainGraph({ nodes, width = 800, height = 500 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const physicsRef = useRef<PhysicsNode[]>([])
  const animFrameRef = useRef<number>(0)
  const pulseRef = useRef(0)

  const color = useCallback((type: string) => TYPE_COLORS[type] ?? TYPE_COLORS.default, [])

  // Initialize physics nodes
  useEffect(() => {
    if (!nodes.length) return
    const cx = width / 2
    const cy = height / 2
    physicsRef.current = nodes.map((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2
      const dist = 80 + Math.random() * (Math.min(width, height) * 0.3)
      return {
        ...n,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 6 + n.importance * 12,
      }
    })
  }, [nodes, width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const edges: [number, number][] = []
    nodes.forEach((n) => {
      if (n.parent_id != null) {
        const parentIdx = physicsRef.current.findIndex(p => p.id === n.parent_id)
        const selfIdx = physicsRef.current.findIndex(p => p.id === n.id)
        if (parentIdx >= 0 && selfIdx >= 0) edges.push([parentIdx, selfIdx])
      }
    })
    // Also create edges between same-type nodes (max 2 per type)
    const byType: Record<string, number[]> = {}
    physicsRef.current.forEach((n, i) => {
      if (!byType[n.type]) byType[n.type] = []
      byType[n.type].push(i)
    })
    Object.values(byType).forEach(idxs => {
      for (let i = 0; i < Math.min(idxs.length - 1, 2); i++) {
        edges.push([idxs[i], idxs[i + 1]])
      }
    })

    const cx = width / 2
    const cy = height / 2

    const simulate = () => {
      const pnodes = physicsRef.current
      if (!pnodes.length) { animFrameRef.current = requestAnimationFrame(simulate); return }

      pulseRef.current += 0.02

      // Physics: repulsion + attraction to center + edge attraction
      for (let i = 0; i < pnodes.length; i++) {
        const a = pnodes[i]
        // Gentle center attraction
        a.vx += (cx - a.x) * 0.0008
        a.vy += (cy - a.y) * 0.0008

        // Node repulsion
        for (let j = i + 1; j < pnodes.length; j++) {
          const b = pnodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const minDist = a.radius + b.radius + 30
          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.05
            a.vx += dx * force; a.vy += dy * force
            b.vx -= dx * force; b.vy -= dy * force
          }
        }
      }

      // Edge spring forces
      edges.forEach(([ai, bi]) => {
        const a = pnodes[ai], b = pnodes[bi]
        if (!a || !b) return
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const target = 100
        const force = (dist - target) / dist * 0.02
        a.vx += dx * force; a.vy += dy * force
        b.vx -= dx * force; b.vy -= dy * force
      })

      // Update positions + damping + boundary
      pnodes.forEach(n => {
        n.vx *= 0.88; n.vy *= 0.88
        n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x + n.vx))
        n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y + n.vy))
      })

      // Draw
      ctx.clearRect(0, 0, width, height)

      // Background grid (subtle)
      ctx.strokeStyle = 'rgba(99,102,241,0.06)'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke() }
      for (let y = 0; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke() }

      // Draw edges with pulse animation
      edges.forEach(([ai, bi], edgeIdx) => {
        const a = pnodes[ai], b = pnodes[bi]
        if (!a || !b) return
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
        const col = color(a.type)
        const pulse = Math.sin(pulseRef.current + edgeIdx * 0.7) * 0.5 + 0.5
        grad.addColorStop(0, col + '33')
        grad.addColorStop(0.5, col + Math.floor(80 + pulse * 100).toString(16).padStart(2, '0'))
        grad.addColorStop(1, color(b.type) + '33')
        ctx.strokeStyle = grad
        ctx.lineWidth = 1 + pulse * 1.5
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        // Slight curve
        const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.1
        const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.1
        ctx.quadraticCurveTo(mx, my, b.x, b.y)
        ctx.stroke()

        // Moving particle on edge
        const t = (Math.sin(pulseRef.current * 1.5 + edgeIdx) * 0.5 + 0.5)
        const px = a.x + (b.x - a.x) * t
        const py = a.y + (b.y - a.y) * t
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = col + 'cc'
        ctx.fill()
      })

      // Draw nodes
      pnodes.forEach((n, idx) => {
        const col = color(n.type)
        const glow = Math.sin(pulseRef.current + idx * 0.5) * 0.3 + 0.7

        // Outer glow
        const outerGrad = ctx.createRadialGradient(n.x, n.y, n.radius * 0.5, n.x, n.y, n.radius * 2.5)
        outerGrad.addColorStop(0, col + Math.floor(glow * 60).toString(16).padStart(2, '0'))
        outerGrad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = outerGrad
        ctx.fill()

        // Node body
        const nodeGrad = ctx.createRadialGradient(n.x - n.radius * 0.3, n.y - n.radius * 0.3, 1, n.x, n.y, n.radius)
        nodeGrad.addColorStop(0, col + 'ff')
        nodeGrad.addColorStop(1, col + 'aa')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
        ctx.fillStyle = nodeGrad
        ctx.fill()

        // Node ring
        ctx.strokeStyle = col
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6 + glow * 0.4
        ctx.stroke()
        ctx.globalAlpha = 1

        // Label
        if (n.radius > 8) {
          ctx.fillStyle = '#fff'
          ctx.font = `${Math.max(9, Math.min(12, n.radius))}px system-ui`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const maxW = n.radius * 2.2
          let label = n.label
          if (ctx.measureText(label).width > maxW) {
            while (ctx.measureText(label + '…').width > maxW && label.length > 2) label = label.slice(0, -1)
            label += '…'
          }
          ctx.fillText(label, n.x, n.y)
        }
      })

      animFrameRef.current = requestAnimationFrame(simulate)
    }

    animFrameRef.current = requestAnimationFrame(simulate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [nodes, width, height, color])

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-indigo-500/20 bg-slate-950" style={{ width, height }}>
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-slate-400 text-sm">Sin memorias aún — el cerebro está vacío</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-indigo-500/20" style={{ width, height, background: '#020817' }}>
      <canvas ref={canvasRef} width={width} height={height} className="block" />

      {/* Legend */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-2 border border-slate-700/50">
        {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'default').map(([type, col]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col, boxShadow: `0 0 6px ${col}` }} />
            <span className="text-xs text-slate-300">{TYPE_LABELS[type] ?? type}</span>
          </div>
        ))}
      </div>

      {/* Node count badge */}
      <div className="absolute bottom-3 left-3 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-3 py-1">
        <span className="text-indigo-300 text-xs font-mono">{nodes.length} nodos neurales</span>
      </div>
    </div>
  )
}
