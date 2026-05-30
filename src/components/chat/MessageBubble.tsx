import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { User, Sparkles, AlertTriangle } from 'lucide-react'

interface Props {
  message: Message
  isStreaming?: boolean
}

function renderContent(text: string) {
  // Light markdown: **bold**, `inline code`, and newlines.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (p === '\n') return <br key={i} />
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]">
          {p.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{p}</span>
  })
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const isError = message.content?.startsWith('⚠️')

  return (
    <div className={cn('flex gap-3 px-4 py-3 group', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm',
        isUser
          ? 'bg-primary text-primary-foreground'
          : isError
            ? 'bg-destructive/10 text-destructive border border-destructive/30'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
      )}>
        {isUser
          ? <User className="h-4 w-4" />
          : isError
            ? <AlertTriangle className="h-4 w-4" />
            : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Content column */}
      <div className={cn('flex max-w-[85%] flex-col gap-1.5', isUser && 'items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : isError
              ? 'bg-destructive/5 border border-destructive/20 text-destructive rounded-tl-md'
              : 'bg-muted rounded-tl-md'
        )}>
          {message.content
            ? renderContent(message.content)
            : isStreaming && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </span>
            )}
          {isStreaming && message.content && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />
          )}
        </div>

        {/* Meta */}
        {!isUser && message.provider && !isError && (
          <div className="flex items-center gap-1.5 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Badge variant="outline" className="h-4 text-[10px] px-1.5 font-normal">
              {message.provider} · {message.model}
            </Badge>
            {message.latency_ms ? (
              <span className="text-[10px] text-muted-foreground">{message.latency_ms}ms</span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
