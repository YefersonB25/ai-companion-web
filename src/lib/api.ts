import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://ai-companion.test/api',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

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

export default api
