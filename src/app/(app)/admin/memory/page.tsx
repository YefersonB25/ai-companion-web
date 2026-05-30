'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import StatCard from '@/components/admin/StatCard'
import BrainScore from '@/components/admin/BrainScore'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'

interface GlobalMemoryData {
  stats: {
    total_nodes: number
    users_with_memory: number
    avg_per_user: number
    growth_rate: number
  }
  growth_chart: Array<{ date: string; total: number }>
  by_type: Array<{ type: string; count: number }>
  top_labels: Array<{ label: string; count: number }>
  users_ranked: Array<{
    id: number
    name: string
    email: string
    memory_nodes: number
    brain_score: number
  }>
}

const TYPE_COLORS: Record<string, string> = {
  person:     '#6366f1',
  event:      '#f59e0b',
  preference: '#10b981',
  skill:      '#3b82f6',
  habit:      '#8b5cf6',
  project:    '#ef4444',
  note:       '#64748b',
}

function formatShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function AdminMemoryPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<GlobalMemoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    adminApi.globalMemory()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Cargando cerebro global...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        No se pudo cargar el cerebro global.
      </div>
    )
  }

  const growthChart = (data.growth_chart ?? []).map((d) => ({
    ...d,
    label: formatShort(d.date),
  }))

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>🧠</span> Cerebro Global
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Memoria acumulada de todos los usuarios</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total nodos"
          value={data.stats.total_nodes.toLocaleString()}
          icon="🧩"
          color="purple"
        />
        <StatCard
          title="Usuarios con memoria"
          value={data.stats.users_with_memory}
          icon="👤"
          color="blue"
        />
        <StatCard
          title="Promedio por usuario"
          value={data.stats.avg_per_user.toFixed(1)}
          icon="📊"
          color="green"
        />
        <StatCard
          title="Tasa de crecimiento"
          value={`${data.stats.growth_rate >= 0 ? '+' : ''}${data.stats.growth_rate}%`}
          icon="📈"
          trend={data.stats.growth_rate}
          color="orange"
        />
      </div>

      {/* Main growth chart */}
      <div className="rounded-xl border bg-gradient-to-br from-indigo-50/60 to-violet-50/30 dark:from-indigo-950/40 dark:to-violet-950/20 border-indigo-200 dark:border-indigo-900 p-6">
        <h2 className="text-sm font-semibold mb-1 text-indigo-700 dark:text-indigo-300">Crecimiento acumulativo del cerebro global</h2>
        <p className="text-xs text-muted-foreground mb-5">Total de nodos de memoria a lo largo del tiempo</p>
        {growthChart.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin datos disponibles</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={growthChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="globalBrainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.15)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6366f1' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#6366f1' }}
                labelStyle={{ color: '#6366f1', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#globalBrainGrad)"
                name="Nodos totales"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Type distribution + top labels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By type horizontal bar */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Distribución por tipo</h2>
          {(data.by_type ?? []).length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.by_type}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Nodos">
                  {(data.by_type ?? []).map((entry, i) => (
                    <rect key={i} fill={TYPE_COLORS[entry.type] ?? '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top labels */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Etiquetas más comunes</h2>
          {(data.top_labels ?? []).length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin etiquetas</div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {data.top_labels.map((item, i) => {
                const opacity = Math.max(0.5, 1 - i * 0.04)
                return (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs px-2.5 py-1 cursor-default"
                    style={{ opacity }}
                  >
                    {item.label}
                    <span className="ml-1.5 text-muted-foreground">{item.count}</span>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Users ranked by brain size */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Usuarios por tamaño de cerebro</h2>
          <span className="text-xs text-muted-foreground">{(data.users_ranked ?? []).length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Nodos</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-48">Brain Score</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(data.users_ranked ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-xs">Sin usuarios</td>
                </tr>
              )}
              {(data.users_ranked ?? []).map((u, i) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {u.memory_nodes}
                  </td>
                  <td className="px-4 py-3">
                    <BrainScore score={u.brain_score} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`}>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300">
                        Ver
                      </Badge>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
