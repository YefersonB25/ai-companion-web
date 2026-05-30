'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Brain, ArrowLeft, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/admin',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users',   icon: Users,           label: 'Usuarios' },
  { href: '/admin/memory',  icon: Brain,           label: 'Cerebro Global' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full w-56 flex-col border-r bg-muted/30 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">Panel Admin</span>
          <Badge className="mt-0.5 w-fit px-1.5 py-0 text-[9px] bg-indigo-600 hover:bg-indigo-600 text-white border-none">
            ADMIN
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Nav links */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <div className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer',
              isActive(href)
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </div>
          </Link>
        ))}
      </nav>

      <Separator />

      {/* Back to chat */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => router.push('/chat')}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Chat
        </Button>
      </div>
    </div>
  )
}
