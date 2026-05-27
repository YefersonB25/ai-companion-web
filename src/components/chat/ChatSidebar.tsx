'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useChatStore } from '@/store/chat'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare, Plus, Brain, Settings, Cpu, LogOut, User
} from 'lucide-react'

const navItems = [
  { href: '/memory',    icon: Brain,          label: 'Mapa Mental' },
  { href: '/providers', icon: Cpu,            label: 'Proveedores IA' },
  { href: '/settings',  icon: Settings,       label: 'Configuración' },
]

export default function ChatSidebar() {
  const { conversations, loadConversations, createConversation } = useChatStore()
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const activeId = params?.id ? Number(params.id) : null

  useEffect(() => { loadConversations() }, [loadConversations])

  const handleNew = async () => {
    const conv = await createConversation()
    router.push(`/chat/${conv.id}`)
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-lg">
          🧠
        </div>
        <span className="font-semibold text-sm">AI Companion</span>
      </div>

      <Separator />

      {/* New conversation */}
      <div className="p-3">
        <Button onClick={handleNew} className="w-full justify-start gap-2" size="sm" variant="outline">
          <Plus className="h-4 w-4" />
          Nueva conversación
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {conversations.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              Sin conversaciones aún
            </p>
          )}
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer',
                activeId === conv.id && 'bg-muted font-medium'
              )}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">
                  {conv.title ?? 'Nueva conversación'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Bottom nav */}
      <div className="p-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
              <Icon className="h-4 w-4" />
              {label}
            </div>
          </Link>
        ))}
      </div>

      <Separator />

      {/* User */}
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => { logout(); router.push('/login') }}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
