import api from './api'

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: () => api.get('/admin/users'),
  userDetail: (id: number) => api.get(`/admin/users/${id}`),
  globalMemory: () => api.get('/admin/memory'),
  insights: () => api.get('/admin/insights'),
  toggleAdmin: (id: number) => api.post(`/admin/users/${id}/toggle-admin`),
}
