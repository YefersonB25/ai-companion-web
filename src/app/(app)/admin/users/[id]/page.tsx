'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import BrainScore from '@/components/admin/BrainScore'
import StatCard from '@/components/admin/StatCard'
import dynamic from 'next/dynamic'
const NeuralBrainGraph = dynamic(() => import('@/components/admin/NeuralBrainGraph'), { ssr: false, loading: () => <div className="h-[400px] bg-slate-950 animate-pulse rounded-xl" /> })
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft } from 'lucide-react'

interface UserDetail {
  user: {
    id: number
    name: string
    email: string
    is_admin: boolean
    created_at: string
  }
  stats: {
    messages_count: number
    conversations_count: number
    memory_nodes: number
    brain_score: number
    last_activity: string | null
  }
  messages_per_day: Array<{ date: string; count: number }>
  brain_growth: Array<{ date: string; total: number }>
  memory_by_type: Array<{ type: string; count: number }>
  recent_memories: Array<{
    id: number
    label: string
    type: string
    importance: number
    created_at: string
  }>
  top_memories: Array<{
    id: number
    label: string
    type: string
    access_count: number
  }>
  recent_conversations: Array<{
    id: number
    title: string | null
    provider: string | null
    messages_count: number
    created_at: string
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatShort(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function AdminUserDetailPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const userId = Number(params?.id)

  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    if (!userId) return
    adminApi.userDetail(userId)
      .then(({ data }) => setDetail(data))
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los datos. Verifica tu conexión.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Cargando usuario...
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        No se encontró el usuario.
      </div>
    )
  }

  const { user: u, stats } = detail

  const messagesPerDay = (detail.messages_per_day ?? []).map((d) => ({
    ...d,
    label: formatShort(d.date),
  }))

  const brainGrowth = (detail.brain_growth ?? []).map((d) => ({
    ...d,
    label: formatShort(d.date),
  }))

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <span>&#9888;</span> {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Cerrar</button>
        </div>
      )}

      {/* Back */}
      <Link href="/admin/users">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a usuarios
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold shadow-md">
          {u.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{u.name}</h1>
            {u.is_admin && <Badge className="bg-indigo-600 text-white border-none text-xs">ADMIN</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{u.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Miembro desde {formatDate(u.created_at)}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Mensajes" value={stats.messages_count.toLocaleString()} icon="💬" color="blue" />
        <StatCard title="Conversaciones" value={stats.conversations_count.toLocaleString()} icon="🗨️" color="green" />
        <StatCard title="Nodos de memoria" value={stats.memory_nodes} icon="🧠" color="purple" />
        <StatCard title="Última actividad" value={formatDate(stats.last_activity)} icon="🕐" color="orange" />
      </div>

      {/* Activity chart */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold mb-4">Actividad — mensajes por día</h2>
        {messagesPerDay.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground text-xs">Sin actividad registrada</div>
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

      {/* The Brain section */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20 p-5">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg">🧠</span>
          <h2 className="text-base font-bold text-indigo-700 dark:text-indigo-300">🧠 Red Neural — El Cerebro</h2>
        </div>

        {/* Brain score */}
        <div className="mb-6">
          <div className="max-w-sm mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Brain Score</p>
            <BrainScore score={stats.brain_score} size="lg" />
          </div>
          {/* Red Neural animada */}
          <div className="w-full overflow-hidden">
            <NeuralBrainGraph
              nodes={(detail.recent_memories ?? []).map((m: any) => ({
                id: m.id, type: m.type, label: m.label,
                importance: m.importance ?? 0.5, parent_id: m.parent_id
              }))}
              height={300}
            />
          </div>
        </div>

        {/* Brain growth + type distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brain growth */}
          <div className="rounded-lg border border-indigo-100 dark:border-indigo-900 bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Crecimiento del cerebro</h3>
            {brainGrowth.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={brainGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userBrainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#userBrainGrad)" name="Nodos" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Type distribution */}
          <div className="rounded-lg border border-indigo-100 dark:border-indigo-900 bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Distribución por tipo</h3>
            {(detail.memory_by_type ?? []).length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-xs">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={detail.memory_by_type}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {detail.memory_by_type.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent memories */}
        <div className="mt-6 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Memorias recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Etiqueta</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">Importancia</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(detail.recent_memories ?? []).length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-muted-foreground">Sin memorias</td></tr>
                )}
                {(detail.recent_memories ?? []).map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-medium">{m.label}</td>
                    <td className="px-4 py-2">
                      <Badge style={{ background: TYPE_COLORS[m.type] ?? '#64748b', color: '#fff', border: 'none' }} className="text-[10px]">
                        {m.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${m.importance * 100}%` }} />
                        </div>
                        <span className="text-muted-foreground">{(m.importance * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDate(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top accessed memories */}
        {(detail.top_memories ?? []).length > 0 && (
          <div className="mt-4 rounded-lg border border-indigo-100 dark:border-indigo-900 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Más accedidas</h3>
            </div>
            <div className="divide-y">
              {detail.top_memories.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Badge style={{ background: TYPE_COLORS[m.type] ?? '#64748b', color: '#fff', border: 'none' }} className="text-[10px]">
                      {m.type}
                    </Badge>
                    <span className="text-xs font-medium">{m.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.access_count} accesos</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent conversations */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold">Conversaciones recientes</h2>
        </div>
        <div className="divide-y">
          {(detail.recent_conversations ?? []).length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">Sin conversaciones</div>
          )}
          {(detail.recent_conversations ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.title ?? 'Sin título'}</p>
                <p className="text-xs text-muted-foreground">
                  {c.provider ?? '—'} · {c.messages_count} mensajes · {formatDate(c.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
