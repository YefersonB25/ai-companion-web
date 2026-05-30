'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import StatCard from '@/components/admin/StatCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, X, RefreshCw } from 'lucide-react'

interface DashboardData {
  stats: {
    active_users: number
    messages_today: number
    memory_nodes: number
    user_growth: number
  }
  messages_per_day: Array<{ date: string; count: number }>
  messages_per_provider: Array<{ provider: string; count: number }>
  brain_growth: Array<{ date: string; total: number }>
}

interface Insight {
  type: string
  title: string
  description: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<Insight[] | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    adminApi.dashboard()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadInsights = async () => {
    setInsightsLoading(true)
    setShowInsights(true)
    try {
      const { data } = await adminApi.insights()
      setInsights(data.insights ?? data)
    } catch {
      setInsights([])
    } finally {
      setInsightsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Cargando dashboard...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        No se pudo cargar el dashboard.
      </div>
    )
  }

  const messagesPerDay = (data.messages_per_day ?? []).map((d) => ({
    ...d,
    label: formatDate(d.date),
  }))

  const brainGrowth = (data.brain_growth ?? []).map((d) => ({
    ...d,
    label: formatDate(d.date),
  }))

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visión general de la plataforma</p>
        </div>
        <Button onClick={loadInsights} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Sparkles className="h-4 w-4" />
          Ver insights
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios activos"
          value={data.stats.active_users}
          subtitle="Total registrados"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Mensajes hoy"
          value={data.stats.messages_today}
          subtitle="En las últimas 24h"
          icon="💬"
          color="green"
        />
        <StatCard
          title="Nodos de memoria"
          value={data.stats.memory_nodes}
          subtitle="Cerebro global"
          icon="🧠"
          color="purple"
        />
        <StatCard
          title="Crecimiento"
          value={`${data.stats.user_growth >= 0 ? '+' : ''}${data.stats.user_growth}%`}
          subtitle="Usuarios este mes"
          icon="📈"
          trend={data.stats.user_growth}
          color="orange"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages per day */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Mensajes por día (últimos 30 días)</h2>
          {messagesPerDay.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={messagesPerDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} name="Mensajes" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Messages per provider */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold mb-4">Mensajes por proveedor</h2>
          {(data.messages_per_provider ?? []).length === 0 ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.messages_per_provider} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="provider" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Mensajes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Brain growth chart */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Crecimiento del Cerebro Global</h2>
        {brainGrowth.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={brainGrowth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="brainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#brainGradient)"
                name="Nodos totales"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights modal */}
      {showInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h2 className="text-base font-semibold">Insights de la plataforma</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowInsights(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {insightsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generando insights...
              </div>
            ) : !insights || insights.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No hay insights disponibles.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {insights.map((insight, i) => (
                  <div key={i} className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{insight.type}</Badge>
                      <span className="text-sm font-medium">{insight.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
