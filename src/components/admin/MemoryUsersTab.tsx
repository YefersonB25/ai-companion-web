'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import BrainScore from '@/components/admin/BrainScore'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface MemoryUsersTabProps {
  users: any[]
}

export default function MemoryUsersTab({ users }: MemoryUsersTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'nodes' | 'score' | 'name'>('nodes')

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.brain_score ?? 0) - (a.brain_score ?? 0)
        case 'name':
          return a.name.localeCompare(b.name)
        case 'nodes':
        default:
          return b.memory_nodes_count - a.memory_nodes_count
      }
    })

    return filtered
  }, [users, searchTerm, sortBy])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Buscar usuario
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Ordenar por
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="nodes">Nodos (↓)</option>
            <option value="score">Brain Score (↓)</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Usuarios</h2>
            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
              {filteredUsers.length} de {users.length}
            </span>
          </div>
          <Link href="/admin/users" className="text-xs text-indigo-500 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/10">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Nodos</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Brain Score</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    {users.length === 0 ? 'Sin usuarios registrados' : 'No coinciden los resultados de búsqueda'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground text-xs font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {u.memory_nodes_count}
                    </td>
                    <td className="px-4 py-3 flex justify-center">
                      <BrainScore score={u.brain_score} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`}>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 transition-colors">
                          Ver
                        </Badge>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
