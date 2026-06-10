'use client'

import { useEffect } from 'react'
import { initializeAuthStore, initializeChatStore } from '@aria/core'
import { apiClient } from '@/lib/api'

export function AriaCoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize @aria/core stores with web-specific configuration
    initializeAuthStore({
      api: apiClient,
      onTokenChange: async (token) => {
        if (!token) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      },
    })

    initializeChatStore({
      api: apiClient,
      channel: 'web',
    })
  }, [])

  return <>{children}</>
}
