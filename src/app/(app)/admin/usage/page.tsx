'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import StatCard from '@/components/admin/StatCard'
import { StatCardSkeleton, ChartSkeleton } from '@/components/admin/AdminSkeleton'

interface UsageData {
  totals: { cost_usd: number; input_tokens: number; output_tokens: number }
  by_provider: Array<{ provider: string; count: number; input_tokens: number; output_tokens: number; cost_usd: number }>
  by_model: Array<{ provider: string; model: string; count: number; input_tokens: number; output_tokens: number; cost_usd: number }>
  cost_by_day: Array<{ date: string; cost_usd: number }>
  top_users: Array<{ user_id: number; name: string; cost_usd: number }>
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const compact = (n: number) => n.toLocaleString('es', { notation: 'compact', maximumFractionDigits: 1 })

export default function AdminUsagePage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    adminApi.usage()
      .then(({ data }) => setData(data))
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los datos de costo. Verifica tu conexión.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton height={260} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl w-full mx-auto">
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
          {error ?? 'Sin datos.'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Costos de IA</h1>
        <p className="text-sm text-muted-foreground">Estimación según tarifas configuradas en <code>config/ai_pricing.php</code>.</p>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Costo total estimado" value={usd(data.totals.cost_usd)} icon="💵" color="green" />
        <StatCard title="Tokens de entrada" value={compact(data.totals.input_tokens)} icon="⬇️" color="blue" />
        <StatCard title="Tokens de salida" value={compact(data.totals.output_tokens)} icon="⬆️" color="purple" />
      </div>

      {/* Costo por día */}
      <div className="rounded-xl border p-5">
        <h2 className="text-sm font-semibold mb-4">Costo diario (últimos 30 días)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.cost_by_day}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(v) => [usd(Number(v)), 'Costo']}
              labelFormatter={(l) => formatDate(l as string)}
            />
            <Area type="monotone" dataKey="cost_usd" stroke="#10b981" fill="url(#costGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costo por proveedor */}
        <div className="rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Costo por proveedor</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.by_provider}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="provider" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [usd(Number(v)), 'Costo']} />
              <Bar dataKey="cost_usd" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top usuarios por costo */}
        <div className="rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Top usuarios por costo</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 font-medium">Usuario</th>
                  <th className="py-2 font-medium text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {data.top_users.length === 0 && (
                  <tr><td colSpan={2} className="py-4 text-center text-muted-foreground">Sin datos aún.</td></tr>
                )}
                {data.top_users.map((u) => (
                  <tr key={u.user_id} className="border-b last:border-0">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2 text-right font-medium">{usd(u.cost_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detalle por modelo */}
      <div className="rounded-xl border p-5">
        <h2 className="text-sm font-semibold mb-4">Detalle por modelo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 font-medium">Proveedor</th>
                <th className="py-2 font-medium">Modelo</th>
                <th className="py-2 font-medium text-right">Mensajes</th>
                <th className="py-2 font-medium text-right">Tokens in</th>
                <th className="py-2 font-medium text-right">Tokens out</th>
                <th className="py-2 font-medium text-right">Costo</th>
              </tr>
            </thead>
            <tbody>
              {data.by_model.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">Sin datos aún.</td></tr>
              )}
              {data.by_model.map((m, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 capitalize">{m.provider}</td>
                  <td className="py-2 font-mono text-xs">{m.model ?? '—'}</td>
                  <td className="py-2 text-right">{m.count.toLocaleString('es')}</td>
                  <td className="py-2 text-right">{compact(m.input_tokens)}</td>
                  <td className="py-2 text-right">{compact(m.output_tokens)}</td>
                  <td className="py-2 text-right font-medium">{usd(m.cost_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
