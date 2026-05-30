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

const CHAR_WARNING = 500

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
    el.style.height = Math.min(el.scrollHeight, 260) + 'px'
  }

  const charCount = value.length
  const overLimit = charCount >= CHAR_WARNING

  return (
    <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm px-4 pt-3 pb-4">
      <div className="mx-auto max-w-3xl">
        <div className={cn(
          'flex items-end gap-3 rounded-2xl border-2 bg-muted/20 px-4 py-3 transition-all duration-200 shadow-sm',
          'focus-within:border-indigo-500/70 focus-within:bg-background focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]',
          disabled || isStreaming ? 'opacity-60' : 'border-border/60'
        )}>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje… (Enter para enviar · Shift+Enter nueva línea)"
            className={cn(
              'min-h-[52px] max-h-[260px] resize-none border-0 bg-transparent p-0 shadow-none',
              'focus-visible:ring-0 text-sm leading-relaxed',
              'placeholder:text-muted-foreground/50 transition-[height] duration-150 ease-out'
            )}
            disabled={disabled || isStreaming}
            rows={2}
          />
          <Button
            size="icon"
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl transition-all duration-150',
              !isStreaming && value.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                : ''
            )}
            onClick={handleSend}
            disabled={(!value.trim() && !isStreaming) || disabled}
            title={isStreaming ? 'Detener respuesta' : 'Enviar mensaje'}
          >
            {isStreaming ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <p className="text-[10px] text-muted-foreground/60">
            AI Companion puede cometer errores. Verifica información importante.
          </p>
          {overLimit && (
            <span className={cn(
              'text-[10px] tabular-nums font-mono transition-colors',
              charCount > 2000 ? 'text-red-400' : 'text-amber-400/80'
            )}>
              {charCount.toLocaleString()} car.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
