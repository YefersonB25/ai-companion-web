'use client'

import { GlobalMemoryData } from '@/types'
import StatCard from '@/components/admin/StatCard'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface MemoryOverviewProps {
  data: GlobalMemoryData
}

function formatShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function MemoryOverview({ data }: MemoryOverviewProps) {
  const growthChart = (data.growth_by_day ?? []).map((d) => ({
    date: d.date,
    total: d.cumulative,
    label: formatShort(d.date),
  }))

  const totalNodes = data.total_nodes ?? 0
  const usersWithMem = data.total_users_with_memory ?? 0
  const avgPerUser = data.avg_nodes_per_user ?? 0
  const growthRate = data.growth_rate_week ?? 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total nodos" value={totalNodes.toLocaleString()} icon="🧩" color="purple" />
        <StatCard title="Usuarios activos" value={usersWithMem} icon="👤" color="blue" />
        <StatCard title="Promedio/usuario" value={avgPerUser.toFixed(1)} icon="📊" color="green" />
        <StatCard
          title="Crecimiento semanal"
          value={`${growthRate >= 0 ? '+' : ''}${growthRate}`}
          icon="📈"
          trend={growthRate}
          color="orange"
        />
      </div>

      {/* Growth Chart */}
      <div className="rounded-xl border bg-gradient-to-br from-indigo-50/60 to-violet-50/30 dark:from-indigo-950/40 dark:to-violet-950/20 border-indigo-200 dark:border-indigo-900 p-6">
        <h2 className="text-sm font-semibold mb-1 text-indigo-700 dark:text-indigo-300">Crecimiento acumulativo</h2>
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
    </div>
  )
}
