import api from './api'

// ─── Secretos / Keys ──────────────────────────────────────────────────
// El valor completo de la key NUNCA llega al cliente. Solo metadatos +
// `configured` (bool) y `last4` (string|null) calculados en el servidor.
export type SecretStatus = 'active' | 'needs_rotation' | 'deprecated'

export interface Secret {
  id: number
  env_var: string
  label: string | null
  app: string | null
  provider: string | null
  description: string | null
  used_in: string | null
  rotation_url: string | null
  last_rotated_at: string | null
  status: SecretStatus
  configured: boolean
  last4: string | null
  notes?: string | null
  sort_order?: number | null
}

// Campos editables (metadatos). No existe campo de valor.
export interface SecretInput {
  env_var?: string
  label?: string | null
  app?: string | null
  provider?: string | null
  description?: string | null
  used_in?: string | null
  rotation_url?: string | null
  last_rotated_at?: string | null
  status?: SecretStatus
  notes?: string | null
  sort_order?: number | null
}

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  usage: () => api.get('/admin/usage'),
  users: () => api.get('/admin/users'),
  userDetail: (id: number) => api.get(`/admin/users/${id}`),
  globalMemory: () => api.get('/admin/memory'),
  insights: () => api.get('/admin/insights'),
  toggleAdmin: (id: number) => api.post(`/admin/users/${id}/toggle-admin`),

  // Secretos / Keys (solo documentación, sin valores)
  getSecrets: () => api.get<Secret[]>('/admin/secrets'),
  updateSecret: (id: number, data: SecretInput) =>
    api.put<Secret>(`/admin/secrets/${id}`, data),
  createSecret: (data: SecretInput) =>
    api.post<Secret>('/admin/secrets', data),
  deleteSecret: (id: number) => api.delete(`/admin/secrets/${id}`),
}
