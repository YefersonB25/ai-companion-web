import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        set({ user: data.user, token: data.token, isLoading: false })
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        const { data } = await api.post('/auth/register', {
          name, email, password, password_confirmation: password,
        })
        localStorage.setItem('token', data.token)
        set({ user: data.user, token: data.token, isLoading: false })
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        localStorage.removeItem('token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        const { data } = await api.get('/auth/me')
        set({ user: data })
      },
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
)
