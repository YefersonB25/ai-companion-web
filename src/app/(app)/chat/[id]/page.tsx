'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useChatStore } from '@/store/chat'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ConversationPage() {
  const params = useParams()
  const id = Number(params.id)
  const { messages, isStreaming, selectConversation, sendMessage, activeConversation } = useChatStore()

  useRealtimeChat(activeConversation?.id ?? null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) selectConversation(id)
  }, [id, selectConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1">
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
      </ScrollArea>

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
      />
    </div>
  )
}
