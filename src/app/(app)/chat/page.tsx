'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Zap, Brain, Mail, Globe, Code2 } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import ChatInput from '@/components/chat/ChatInput'
import { useAuthStore } from '@/store/auth'

const suggestions = [
  { icon: Sparkles, text: 'Planifica mi semana',          desc: 'Organiza tareas y prioridades' },
  { icon: Globe,    text: 'Busca noticias de hoy',        desc: 'Con búsqueda web en tiempo real' },
  { icon: Code2,    text: 'Analiza y mejora este código', desc: 'Revisión y sugerencias de código' },
  { icon: Mail,     text: 'Redacta un email profesional', desc: 'Con tono y formato adecuados' },
  { icon: Brain,    text: 'Explícame un concepto',        desc: 'De forma simple y clara' },
  { icon: Zap,      text: '¿Qué puedes hacer?',           desc: 'Descubre las capacidades de Aria' },
]

export default function ChatPage() {
  const router = useRouter()
  const { sendMessage, createConversation, isStreaming } = useChatStore()
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] ?? ''

  const startWith = async (text: string) => {
    const conv = await createConversation()
    router.push(`/chat/${conv.id}`)
    setTimeout(() => sendMessage(text), 100)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Welcome area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 overflow-y-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {firstName ? `Hola, ${firstName}` : '¿En qué puedo ayudarte?'}
          </h1>
          {firstName && (
            <p className="text-lg text-muted-foreground">¿En qué puedo ayudarte hoy?</p>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
          {suggestions.map(({ icon: Icon, text, desc }) => (
            <button
              key={text}
              onClick={() => startWith(text)}
              className="group flex flex-col gap-1.5 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-muted hover:shadow-sm active:scale-[0.98]"
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium leading-tight">{text}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
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
