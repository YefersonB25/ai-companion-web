'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import ChatSidebar from '@/components/chat/ChatSidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token && !user) router.replace('/login')
  }, [token, user, router])

  if (!token && !user) return null

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
