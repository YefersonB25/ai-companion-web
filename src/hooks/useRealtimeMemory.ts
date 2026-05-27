'use client'

import { useEffect } from 'react'
import { getEcho } from '@/lib/echo'
import { useAuthStore } from '@/store/auth'

interface MemoryNode {
  id: number
  type: string
  label: string
  content: string
  importance: number
  parent_id: number | null
  attributes: Record<string, unknown> | null
}

export function useRealtimeMemory(onNewNode: (node: MemoryNode) => void) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user || !token) return

    const echo = getEcho(token)
    const channel = echo.private(`users.${user.id}`)

    channel.listen('.memory.saved', (data: MemoryNode) => {
      onNewNode(data)
    })

    return () => {
      echo.leave(`users.${user.id}`)
    }
  }, [user?.id, token, onNewNode])
}
