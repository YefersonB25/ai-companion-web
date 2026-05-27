import { create } from 'zustand'
import { Conversation, Message } from '@/types'
import api from '@/lib/api'

interface ChatState {
  conversations: Conversation[]
  activeConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  streamEndedAt: number | null

  loadConversations: () => Promise<void>
  createConversation: () => Promise<Conversation>
  selectConversation: (id: number) => Promise<void>
  sendMessage: (content: string, provider?: string) => Promise<void>
  addMessage: (msg: Message) => void
  appendStreamChunk: (chunk: string) => void
  startStream: () => void
  endStream: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isStreaming: false,
  streamEndedAt: null,

  loadConversations: async () => {
    const { data } = await api.get('/conversations')
    set({ conversations: data.data ?? data })
  },

  createConversation: async () => {
    const { data } = await api.post('/conversations', { channel: 'web' })
    set((s) => ({ conversations: [data, ...s.conversations], activeConversation: data, messages: [] }))
    return data
  },

  selectConversation: async (id) => {
    const { data } = await api.get(`/conversations/${id}`)
    set({ activeConversation: data, messages: data.messages ?? [] })
  },

  sendMessage: async (content, provider) => {
    const state = get()
    let conversation = state.activeConversation

    if (!conversation) {
      conversation = await get().createConversation()
    }

    const userMsg: Message = {
      id: Date.now(),
      conversation_id: conversation.id,
      user_id: 0,
      role: 'user',
      content,
      provider: null,
      model: null,
      input_tokens: 0,
      output_tokens: 0,
      latency_ms: null,
      created_at: new Date().toISOString(),
    }
    set((s) => ({ messages: [...s.messages, userMsg] }))

    const streamMsg: Message = {
      id: Date.now() + 1,
      conversation_id: conversation.id,
      user_id: 0,
      role: 'assistant',
      content: '',
      provider: null,
      model: null,
      input_tokens: 0,
      output_tokens: 0,
      latency_ms: null,
      created_at: new Date().toISOString(),
    }

    get().startStream()
    set((s) => ({ messages: [...s.messages, streamMsg] }))

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://ai-companion.test/api'}/conversations/${conversation.id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, provider, stream: true }),
      }
    )

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6))
              if (json.chunk) get().appendStreamChunk(json.chunk)
            } catch {}
          }
        }
      }
    }

    get().endStream()
    await get().loadConversations()
  },

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  appendStreamChunk: (chunk) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk }
      }
      return { messages: msgs }
    }),

  startStream: () => set({ isStreaming: true, streamEndedAt: null }),
  endStream: () => set({ isStreaming: false, streamEndedAt: Date.now() }),
}))
