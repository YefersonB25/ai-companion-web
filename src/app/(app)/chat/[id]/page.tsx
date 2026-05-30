'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'

export default function ConversationPage() {
  const params = useParams()
  const id = Number(params.id)
  const { messages, isStreaming, selectConversation, sendMessage, activeConversation } = useChatStore()

  const connected = useRealtimeChat(activeConversation?.id ?? null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) selectConversation(id)
  }, [id, selectConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!connected && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Sin conexión en tiempo real — los mensajes nuevos no se actualizarán automáticamente
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-2 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                <span className="text-lg">✨</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Envía tu primer mensaje para comenzar
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
      />
    </div>
  )
}
