'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSend: (content: string) => void
  isStreaming: boolean
  disabled?: boolean
}

export default function ChatInput({ onSend, isStreaming, disabled }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const content = value.trim()
    if (!content || isStreaming) return
    onSend(content)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className={cn(
          'flex items-end gap-2 rounded-xl border bg-muted/30 p-2 transition-colors',
          'focus-within:border-primary/50 focus-within:bg-background'
        )}>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
            className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0 text-sm"
            disabled={disabled || isStreaming}
            rows={1}
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg"
            onClick={handleSend}
            disabled={!value.trim() || isStreaming || disabled}
          >
            {isStreaming ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          AI Companion puede cometer errores. Verifica información importante.
        </p>
      </div>
    </div>
  )
}
