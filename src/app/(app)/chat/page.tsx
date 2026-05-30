'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Zap, Brain, Mail } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import ChatInput from '@/components/chat/ChatInput'

const suggestions = [
  { icon: Sparkles, text: 'Ayúdame a planificar mi semana' },
  { icon: Zap,      text: 'Analiza este código y mejóralo' },
  { icon: Brain,    text: 'Explícame este concepto técnico' },
  { icon: Mail,     text: 'Redacta un email profesional' },
]

export default function ChatPage() {
  const router = useRouter()
  const { sendMessage, createConversation, isStreaming } = useChatStore()

  const startWith = async (text: string) => {
    const conv = await createConversation()
    router.push(`/chat/${conv.id}`)
    setTimeout(() => sendMessage(text), 100)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">¿En qué puedo ayudarte?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu asistente personal con memoria. Pregunta lo que quieras.
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map(({ icon: Icon, text }) => (
            <button
              key={text}
              onClick={() => startWith(text)}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <span>{text}</span>
            </button>
          ))}
        </div>
      </div>

      <ChatInput
        onSend={async (text) => {
          const conv = await createConversation()
          router.push(`/chat/${conv.id}`)
          setTimeout(() => sendMessage(text), 100)
        }}
        isStreaming={isStreaming}
      />
    </div>
  )
}
