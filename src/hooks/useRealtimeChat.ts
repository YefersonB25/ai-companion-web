'use client'

import { useEffect } from 'react'
import { getEcho } from '@/lib/echo'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { Message } from '@/types'

export function useRealtimeChat(conversationId: number | null) {
  const token = useAuthStore((s) => s.token)
  const { addMessage } = useChatStore()

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

    return () => {
      echo.leave(`conversations.${conversationId}`)
    }
  }, [conversationId, token])
}
