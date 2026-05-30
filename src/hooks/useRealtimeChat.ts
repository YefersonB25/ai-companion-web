'use client'

import { useEffect, useState } from 'react'
import { getEcho } from '@/lib/echo'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { Message } from '@/types'

export function useRealtimeChat(conversationId: number | null): boolean {
  const token = useAuthStore((s) => s.token)
  const { addMessage } = useChatStore()
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    if (!conversationId || !token) return

    const echo = getEcho(token)

    const channel = echo.private(`conversations.${conversationId}`)

    channel.listen('.message.created', (data: Message) => {
      const { isStreaming, streamEndedAt, messages } = useChatStore.getState()
      if (isStreaming) return
      // Ignore our own stream echo (Reverb fires within ~2s of stream end)
      if (streamEndedAt && Date.now() - streamEndedAt < 3000) return
      if (messages.some((m) => m.id === data.id)) return
      addMessage(data)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channel.error((error: any) => {
      console.error('Reverb channel error:', error)
      setConnected(false)
    })

    const pusherConnection = echo.connector?.pusher?.connection
    if (pusherConnection) {
      const onConnected = () => setConnected(true)
      const onDisconnected = () => setConnected(false)
      const onUnavailable = () => setConnected(false)

      pusherConnection.bind('connected', onConnected)
      pusherConnection.bind('disconnected', onDisconnected)
      pusherConnection.bind('unavailable', onUnavailable)

      // Sync current state
      const state = pusherConnection.state
      setConnected(state === 'connected')

      return () => {
        pusherConnection.unbind('connected', onConnected)
        pusherConnection.unbind('disconnected', onDisconnected)
        pusherConnection.unbind('unavailable', onUnavailable)
        echo.leave(`conversations.${conversationId}`)
      }
    }

    return () => {
      echo.leave(`conversations.${conversationId}`)
    }
  }, [conversationId, token])

  return connected
}
