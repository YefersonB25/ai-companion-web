'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useChatStore } from '@/store/chat'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/ui/ThemeToggle'
import {
  MessageSquare, Brain, Settings, Cpu, LogOut, User,
  Smartphone, Sparkles, ShieldCheck, Search, ChevronLeft, ChevronRight, Pencil
} from 'lucide-react'
import type { Conversation } from '@/types'

const navItems = [
  { href: '/profile',   icon: User,        label: 'Mi Perfil' },
  { href: '/memory',    icon: Brain,       label: 'Mapa Mental' },
  { href: '/providers', icon: Cpu,         label: 'Proveedores IA' },
  { href: '/settings',  icon: Settings,    label: 'Configuración' },
  { href: '/download',  icon: Smartphone,  label: 'App Android' },
]

function groupByDate(convs: Conversation[]) {
  const now = new Date()
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const lastWeek  = new Date(today.getTime() - 7 * 86400000)
  const lastMonth = new Date(today.getTime() - 30 * 86400000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Hoy',            items: [] },
    { label: 'Ayer',           items: [] },
    { label: 'Últimos 7 días', items: [] },
    { label: 'Últimos 30 días', items: [] },
    { label: 'Anteriores',     items: [] },
  ]

  convs.forEach(c => {
    const d = new Date(c.created_at)
    if (d >= today)          groups[0].items.push(c)
    else if (d >= yesterday) groups[1].items.push(c)
    else if (d >= lastWeek)  groups[2].items.push(c)
    else if (d >= lastMonth) groups[3].items.push(c)
    else                     groups[4].items.push(c)
  })

  return groups.filter(g => g.items.length > 0)
}

export default function ChatSidebar() {
  const { conversations, loadConversations, createConversation } = useChatStore()
  const { user, logout } = useAuthStore()
  const router  = useRouter()
  const params  = useParams()
  const activeId = params?.id ? Number(params.id) : null

  const [search, setSearch]       = useState('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { loadConversations() }, [loadConversations])

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter(c => (c.title ?? 'Nueva conversación').toLowerCase().includes(q))
  }, [conversations, search])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const handleNew = async () => {
    const conv = await createConversation()
    router.push(`/chat/${conv.id}`)
  }

  if (collapsed) {
    return (
      <div className="flex h-screen w-14 flex-col items-center border-r bg-muted/30 py-3 gap-3 overflow-hidden">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(false)} title="Expandir sidebar">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNew} title="Nueva conversación">
          <Pencil className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { logout(); router.push('/login') }}>
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-64 min-w-[256px] max-w-[256px] flex-col border-r bg-muted/30 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm flex-shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-sm flex-1 truncate">AI Companion</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleNew} title="Nueva conversación">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setCollapsed(true)} title="Colapsar">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Conversation list — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
        {groups.length === 0 && (
          <p className="px-3 py-6 text-xs text-muted-foreground text-center">
            {search ? 'Sin resultados' : 'Sin conversaciones aún'}
          </p>
        )}
        {groups.map(group => (
          <div key={group.label}>
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(conv => (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <div className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted cursor-pointer',
                    activeId === conv.id && 'bg-muted font-medium'
                  )}>
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1 text-xs">
                      {conv.title ?? 'Nueva conversación'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Nav items */}
      <div className="p-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </div>
          </Link>
        ))}
        {user?.is_admin && (
          <Link href="/admin">
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Admin
            </div>
          </Link>
        )}
      </div>

      <Separator />

      {/* User + theme toggle */}
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{user?.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
        </div>
        <ThemeToggle />
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
