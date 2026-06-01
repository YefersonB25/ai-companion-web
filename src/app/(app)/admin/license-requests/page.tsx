'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import type { LicenseRequest, PaginatedResponse } from '@/types'
import { Inbox, CheckCircle2, XCircle, Loader2, Clock, Phone, Mail, Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LicenseRequestsPage() {
  const [requests, setRequests] = useState<PaginatedResponse<LicenseRequest> | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionId, setActionId] = useState<number | null>(null)
  const [acceptId, setAcceptId] = useState<number | null>(null)
  const [acceptForm, setAcceptForm] = useState({ expires_at: '', price_paid: '', admin_notes: '' })
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectNotes, setRejectNotes] = useState('')

  const defaultExpiryFor = (plan: string) => {
    const d = new Date()
    if (plan === 'yearly') d.setFullYear(d.getFullYear() + 1)
    else d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get<PaginatedResponse<LicenseRequest>>(`/admin/license-requests?status=${statusFilter}`)
      .then(({ data }) => setRequests(data))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const handleAccept = async (req: LicenseRequest) => {
    if (!acceptForm.expires_at) return
    setActionId(req.id)
    try {
      await api.post(`/admin/license-requests/${req.id}/accept`, {
        expires_at: acceptForm.expires_at,
        price_paid: acceptForm.price_paid ? parseInt(acceptForm.price_paid) : null,
        admin_notes: acceptForm.admin_notes || null,
      })
      setAcceptId(null)
      setAcceptForm({ expires_at: '', price_paid: '', admin_notes: '' })
      load()
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id: number) => {
    setActionId(id)
    try {
      await api.post(`/admin/license-requests/${id}/reject`, { admin_notes: rejectNotes || null })
      setRejectId(null)
      setRejectNotes('')
      load()
    } finally {
      setActionId(null)
    }
  }

  const planLabel = { monthly: 'Mensual', yearly: 'Anual' }
  const statusBadge = (status: LicenseRequest['status']) => {
    if (status === 'pending')  return <Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
    if (status === 'accepted') return <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Aceptada</Badge>
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-indigo-500" />
            Solicitudes de Licencia
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Revisa y gestiona las solicitudes enviadas por los usuarios
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="accepted">Aceptadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No hay solicitudes{statusFilter === 'pending' ? ' pendientes' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests?.data.map(req => (
            <Card key={req.id} className={
              req.status === 'pending'
                ? 'border-amber-200 dark:border-amber-900/50'
                : req.status === 'accepted'
                ? 'border-emerald-200 dark:border-emerald-900/50'
                : ''
            }>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{req.name}</p>
                      {statusBadge(req.status)}
                      <Badge variant="outline">{planLabel[req.plan_type]}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(req.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{req.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{req.phone}</span>
                      </div>
                      {req.company && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{req.company}</span>
                        </div>
                      )}
                      {req.city && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{req.city}</span>
                        </div>
                      )}
                    </div>

                    {req.admin_notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                        Nota: {req.admin_notes}
                      </p>
                    )}
                    {req.catalog_sent_at && (
                      <p className="text-xs text-muted-foreground">
                        ✉ Catálogo enviado: {new Date(req.catalog_sent_at).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {acceptId === req.id ? (
                        <div className="space-y-2 w-56">
                          <div className="space-y-1">
                            <Label className="text-xs">Vencimiento *</Label>
                            <Input
                              type="date"
                              className="h-8 text-xs"
                              value={acceptForm.expires_at || defaultExpiryFor(req.plan_type)}
                              onChange={e => setAcceptForm(f => ({ ...f, expires_at: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Precio pagado (COP)</Label>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              placeholder="Opcional"
                              value={acceptForm.price_paid}
                              onChange={e => setAcceptForm(f => ({ ...f, price_paid: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nota interna</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="Opcional"
                              value={acceptForm.admin_notes}
                              onChange={e => setAcceptForm(f => ({ ...f, admin_notes: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm" className="h-7 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              onClick={() => handleAccept(req)} disabled={actionId === req.id}
                            >
                              {actionId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                              Confirmar
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAcceptId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : rejectId === req.id ? (
                        <div className="space-y-2 w-48">
                          <Input
                            className="h-8 text-xs"
                            placeholder="Motivo del rechazo (opcional)"
                            value={rejectNotes}
                            onChange={e => setRejectNotes(e.target.value)}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm" variant="destructive" className="h-7 flex-1 text-xs"
                              onClick={() => handleReject(req.id)} disabled={actionId === req.id}
                            >
                              {actionId === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirmar'}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setRejectId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() => { setAcceptId(req.id); setAcceptForm({ expires_at: defaultExpiryFor(req.plan_type), price_paid: '', admin_notes: '' }) }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Aceptar y crear licencia
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => setRejectId(req.id)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
