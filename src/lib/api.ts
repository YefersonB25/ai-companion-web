import { createApiClient } from '@aria/core'

// Base client for stores
export const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://ai-companion.test/api',
  getToken: async () => localStorage.getItem('token'),
  setToken: async (token) => localStorage.setItem('token', token),
  timeout: 30000,
})

// Wrapper for pages that expect { data: T } format
export const api = {
  async get<T = any>(path: string, config?: any) {
    const data = await apiClient.get<T>(path, config)
    return { data }
  },
  async post<T = any>(path: string, body?: any, config?: any) {
    const data = await apiClient.post<T>(path, body, config)
    return { data }
  },
  async put<T = any>(path: string, body?: any, config?: any) {
    const data = await apiClient.put<T>(path, body, config)
    return { data }
  },
  async patch<T = any>(path: string, body?: any, config?: any) {
    const data = await apiClient.patch<T>(path, body, config)
    return { data }
  },
  async delete<T = any>(path: string, config?: any) {
    const data = await apiClient.delete<T>(path, config)
    return { data }
  },
  stream: apiClient.stream.bind(apiClient),
  getStreamUrl: apiClient.getStreamUrl.bind(apiClient),
}

export default api

// ─── Integraciones (Google Calendar / Gmail) ──────────────────────────
export interface Integration {
  provider: string
  account_email: string | null
  scopes: string[] | null
  connected: boolean
  expired: boolean
  connected_at: string | null
}

export const getIntegrations = () =>
  api.get<{ integrations: Integration[] }>('/integrations')

export const connectGoogle = () =>
  api.get<{ url: string }>('/integrations/google/connect')

export const disconnectGoogle = () => api.delete('/integrations/google')

// ─── TTS (proveedor de voz) ──────────────────────────────────────────
export interface TtsProvidersResponse {
  providers: string[]
  default: string
  selected: string | null
}

export const getTtsProviders = () =>
  api.get<TtsProvidersResponse>('/tts/providers')
