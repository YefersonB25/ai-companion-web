import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { User, Bot } from 'lucide-react'

interface Props {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 px-4 py-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted border'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted rounded-tl-sm'
        )}>
          {message.content}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-current" />
          )}
        </div>

        {/* Meta */}
        {!isUser && message.provider && (
          <div className="flex items-center gap-1.5 px-1">
            <Badge variant="outline" className="h-4 text-[10px] px-1.5">
              {message.provider} · {message.model}
            </Badge>
            {message.latency_ms && (
              <span className="text-[10px] text-muted-foreground">{message.latency_ms}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
