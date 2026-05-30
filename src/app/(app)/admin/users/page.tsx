'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi } from '@/lib/adminApi'
import BrainScore from '@/components/admin/BrainScore'
import { TableSkeleton } from '@/components/admin/AdminSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface AdminUser {
  id: number
  name: string
  email: string
  messages_count: number
  conversations_count: number
  memory_nodes: number
  brain_score: number
  last_activity: string | null
  is_admin: boolean
}

function memoryBadge(nodes: number) {
  if (nodes >= 50) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">{nodes}</Badge>
  if (nodes >= 20) return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">{nodes}</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">{nodes}</Badge>
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    adminApi.users()
      .then(({ data }) => setUsers(data.users ?? data))
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los datos. Verifica tu conexión.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <TableSkeleton rows={6} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <span>&#9888;</span> {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Cerrar</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} usuarios registrados</p>
      </div>

      <div className="rounded-xl border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Mensajes</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Conversaciones</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Nodos memoria</th>
                <th className="px-4 py-3 font-medium text-muted-foreground w-40">Brain Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Última actividad</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {u.name}
                          {u.is_admin && <Badge className="bg-indigo-600 text-white border-none text-[9px] px-1 py-0">ADMIN</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{u.messages_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{u.conversations_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{memoryBadge(u.memory_nodes)}</td>
                  <td className="px-4 py-3">
                    <BrainScore score={u.brain_score} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(u.last_activity)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                        Ver detalle
                        <ChevronRight className="h-3 w-3" />
                      </Button>
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
