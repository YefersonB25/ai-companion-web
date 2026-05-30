import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { User, Sparkles, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'
  const isError = message.content?.startsWith('⚠️')
  const timestamp = message.created_at ? formatTimestamp(message.created_at) : null

  return (
    <div className={cn(
      'flex gap-3 px-4 py-2 group',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mt-0.5',
        isUser
          ? 'bg-indigo-600 text-white'
          : isError
            ? 'bg-destructive/10 text-destructive border border-destructive/30'
            : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/20 shadow-md'
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5" />
          : isError
            ? <AlertTriangle className="h-3.5 w-3.5" />
            : <Sparkles className="h-3.5 w-3.5" />}
      </div>

      {/* Content column */}
      <div className={cn(
        'flex max-w-[80%] flex-col gap-1',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed break-words',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/10'
            : isError
              ? 'bg-destructive/5 border border-destructive/20 text-destructive rounded-tl-sm'
              : 'bg-muted/60 border border-border/40 rounded-tl-sm'
        )}>
          {message.content
            ? isUser
              ? <p className="whitespace-pre-wrap">{message.content}</p>
              : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-sm prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-p:my-1 prose-headings:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )
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

        {/* Meta row — visible on group hover */}
        <div className={cn(
          'flex items-center gap-2 px-1 transition-opacity duration-150',
          'opacity-0 group-hover:opacity-100'
        )}>
          {timestamp && (
            <span className="text-[10px] text-muted-foreground/70 tabular-nums">
              {timestamp}
            </span>
          )}
          {!isUser && message.provider && !isError && (
            <>
              {timestamp && <span className="text-[10px] text-muted-foreground/40">·</span>}
              <Badge variant="outline" className="h-4 text-[10px] px-1.5 font-normal border-border/50">
                {message.provider} · {message.model}
              </Badge>
              {message.latency_ms ? (
                <span className="text-[10px] text-muted-foreground/70">{message.latency_ms}ms</span>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
