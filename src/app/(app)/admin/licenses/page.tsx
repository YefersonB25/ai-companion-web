'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import type { License, LicenseSetting, PaginatedResponse, User } from '@/types'
import { Key, Plus, X, RotateCcw, Loader2, Search, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface GrantFormState {
  user_id: string
  type: 'monthly' | 'yearly' | 'custom'
  expires_at: string
  price_paid: string
  notes: string
}

const defaultForm: GrantFormState = {
  user_id: '',
  type: 'monthly',
  expires_at: '',
  price_paid: '',
  notes: '',
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<PaginatedResponse<License> | null>(null)
  const [settings, setSettings] = useState<LicenseSetting | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showGrant, setShowGrant] = useState(false)
  const [form, setForm] = useState<GrantFormState>(defaultForm)
  const [granting, setGranting] = useState(false)
  const [actionId, setActionId] = useState<number | null>(null)
  const [renewId, setRenewId] = useState<number | null>(null)
  const [renewExpiry, setRenewExpiry] = useState('')

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    const [lic, sett] = await Promise.all([
      api.get<PaginatedResponse<License>>(`/admin/licenses?${params}`),
      api.get<LicenseSetting>('/admin/license/settings'),
    ])
    setLicenses(lic.data)
    setSettings(sett.data)
  }, [search, statusFilter])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load])

  useEffect(() => {
    // Load users for grant form
    api.get<{ data: User[] }>('/admin/users').then(({ data }) => setUsers(data.data ?? []))
  }, [])

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    setGranting(true)
    try {
      await api.post('/admin/licenses', {
        user_id: parseInt(form.user_id),
        type: form.type,
        expires_at: form.expires_at,
        price_paid: form.price_paid ? parseInt(form.price_paid) : null,
        notes: form.notes || null,
      })
      setShowGrant(false)
      setForm(defaultForm)
      load()
    } finally {
      setGranting(false)
    }
  }

  const handleRevoke = async (id: number) => {
    setActionId(id)
    try {
      await api.post(`/admin/licenses/${id}/revoke`)
      load()
    } finally {
      setActionId(null)
    }
  }

  const handleRenew = async (id: number) => {
    if (!renewExpiry) return
    setActionId(id)
    try {
      await api.post(`/admin/licenses/${id}/renew`, { expires_at: renewExpiry })
      setRenewId(null)
      setRenewExpiry('')
      load()
    } finally {
      setActionId(null)
    }
  }

  const statusBadge = (lic: License) => {
    const isActive = lic.status === 'active' && new Date(lic.expires_at) > new Date()
    if (isActive) return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">Activa</Badge>
    if (lic.status === 'revoked') return <Badge variant="destructive">Revocada</Badge>
    return <Badge variant="outline" className="border-amber-500 text-amber-600">Vencida</Badge>
  }

  const typeLabel = { monthly: 'Mensual', yearly: 'Anual', custom: 'Personalizada' }

  const defaultExpiryFor = (type: string) => {
    const d = new Date()
    if (type === 'yearly') d.setFullYear(d.getFullYear() + 1)
    else d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6 text-indigo-500" />
            Licencias
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {settings?.licenses_required
              ? '🔒 Licencias requeridas — App protegida'
              : '🔓 App abierta — licencias opcionales'}
          </p>
        </div>
        <Button
          onClick={() => setShowGrant(true)}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Otorgar licencia
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="expired">Vencidas</option>
          <option value="revoked">Revocadas</option>
        </select>
      </div>

      {/* Grant form */}
      {showGrant && (
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Otorgar nueva licencia</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowGrant(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGrant} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Usuario *</Label>
                <select
                  required
                  value={form.user_id}
                  onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de plan *</Label>
                <select
                  value={form.type}
                  onChange={e => {
                    const t = e.target.value as GrantFormState['type']
                    setForm(f => ({ ...f, type: t, expires_at: defaultExpiryFor(t) }))
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de vencimiento *</Label>
                <Input
                  type="date"
                  required
                  value={form.expires_at || defaultExpiryFor(form.type)}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Precio pagado (COP)</Label>
                <Input
                  type="number"
                  placeholder="Opcional"
                  value={form.price_paid}
                  onChange={e => setForm(f => ({ ...f, price_paid: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notas</Label>
                <Input
                  placeholder="Notas internas (opcional)"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowGrant(false)}>Cancelar</Button>
                <Button type="submit" disabled={granting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {granting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
                  Otorgar licencia
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Clave</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vencimiento</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {licenses?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-10">
                    No hay licencias registradas
                  </td>
                </tr>
              )}
              {licenses?.data.map(lic => {
                const isActive = lic.status === 'active' && new Date(lic.expires_at) > new Date()
                const daysLeft = isActive
                  ? Math.ceil((new Date(lic.expires_at).getTime() - Date.now()) / 86400000)
                  : 0

                return (
                  <tr key={lic.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{lic.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{lic.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{lic.key}</td>
                    <td className="px-4 py-3">{typeLabel[lic.type]}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {statusBadge(lic)}
                        {isActive && daysLeft <= 7 && (
                          <span className="text-[10px] text-amber-600">⚠ {daysLeft}d</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(lic.expires_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {renewId === lic.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="date"
                              className="h-7 w-32 text-xs"
                              value={renewExpiry}
                              onChange={e => setRenewExpiry(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Button size="sm" variant="outline" className="h-7 text-xs px-2"
                              onClick={() => handleRenew(lic.id)} disabled={actionId === lic.id}>
                              {actionId === lic.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2"
                              onClick={() => setRenewId(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              onClick={() => { setRenewId(lic.id); setRenewExpiry(defaultExpiryFor(lic.type)) }}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Renovar
                            </Button>
                            {isActive && (
                              <Button
                                size="sm" variant="outline"
                                className="h-7 text-xs px-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => handleRevoke(lic.id)}
                                disabled={actionId === lic.id}
                              >
                                {actionId === lic.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                Revocar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
