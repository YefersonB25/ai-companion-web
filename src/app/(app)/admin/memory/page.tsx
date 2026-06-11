'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import { GlobalMemoryData } from '@/types'
import MemoryOverview from '@/components/admin/MemoryOverview'
import MemoryAnalysis from '@/components/admin/MemoryAnalysis'
import MemoryUsersTab from '@/components/admin/MemoryUsersTab'
import MemoryNeuralTab from '@/components/admin/MemoryNeuralTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshCw } from 'lucide-react'

export default function AdminMemoryPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [data, setData] = useState<GlobalMemoryData | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<any>(null)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  useEffect(() => {
    Promise.all([
      adminApi.globalMemory().then(({ data }) => setData(data)),
      adminApi.users().then(({ data }) => setUsers(data)),
    ]).catch(console.error).finally(() => setLoading(false))
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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>🧠</span> Cerebro Global
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Memoria acumulada de todos los usuarios</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="analysis">🔍 Análisis</TabsTrigger>
          <TabsTrigger value="users">👥 Usuarios</TabsTrigger>
          <TabsTrigger value="neural">🧠 Red Neural</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MemoryOverview data={data} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <MemoryAnalysis data={data} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <MemoryUsersTab users={users} />
        </TabsContent>

        <TabsContent value="neural" className="space-y-6">
          <MemoryNeuralTab data={data} onNodeSelect={setSelectedNode} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
