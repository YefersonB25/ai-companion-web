'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlobalMemoryData } from '@/types'

interface MemoryTabsProps {
  data: GlobalMemoryData
  users: any[]
  onNodeSelect: (node: any) => void
}

export default function MemoryTabs({ data, users, onNodeSelect }: MemoryTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="overview">📊 Overview</TabsTrigger>
        <TabsTrigger value="analysis">🔍 Análisis</TabsTrigger>
        <TabsTrigger value="users">👥 Usuarios</TabsTrigger>
        <TabsTrigger value="neural">🧠 Red Neural</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Overview content will be imported */}
      </TabsContent>

      <TabsContent value="analysis" className="space-y-6">
        {/* Analysis content will be imported */}
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        {/* Users content will be imported */}
      </TabsContent>

      <TabsContent value="neural" className="space-y-6">
        {/* Neural content will be imported */}
      </TabsContent>
    </Tabs>
  )
}
