import { Bot, Sparkles, Zap, Brain } from 'lucide-react'

const suggestions = [
  { icon: Sparkles, text: 'Ayúdame a planificar mi semana' },
  { icon: Zap,      text: 'Analiza este código y mejóralo' },
  { icon: Brain,    text: 'Explícame este concepto técnico' },
  { icon: Bot,      text: 'Redacta un email profesional' },
]

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
          🧠
        </div>
        <h1 className="text-2xl font-semibold">¿En qué puedo ayudarte?</h1>
        <p className="mt-2 text-muted-foreground">
          Tu asistente personal con memoria. Empieza una nueva conversación.
        </p>
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {suggestions.map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
