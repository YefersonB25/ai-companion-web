'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { LicenseStatus } from '@/types'
import { Key, CheckCircle2, AlertTriangle, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LicensePage() {
  const router = useRouter()
  const [status, setStatus] = useState<LicenseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<LicenseStatus>('/license/status')
      .then(({ data }) => setStatus(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const license = status?.license
  const isActive = license?.is_active
  const isExpired = license && !license.is_active && license.status !== 'revoked'
  const isRevoked = license?.status === 'revoked'

  const statusColor = isActive
    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/50'
    : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50'

  const typeLabel = { monthly: 'Mensual', yearly: 'Anual', custom: 'Personalizada' }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6 text-indigo-500" />
            Mi Licencia
          </h1>
          <p className="text-muted-foreground text-sm">
            Estado y detalles de tu licencia de acceso
          </p>
        </div>

        {/* License card */}
        {license ? (
          <Card className={`border ${statusColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                  Licencia {typeLabel[license.type] ?? license.type}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    isActive
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : isRevoked
                      ? 'border-red-400 text-red-500'
                      : 'border-amber-500 text-amber-600 dark:text-amber-400'
                  }
                >
                  {isActive ? 'Activa' : isRevoked ? 'Revocada' : 'Vencida'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Clave</p>
                  <p className="font-mono font-semibold">{license.key}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Inicio</p>
                  <p>{new Date(license.starts_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Vencimiento</p>
                  <p className={isExpired ? 'text-amber-600 font-semibold' : ''}>
                    {new Date(license.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {isActive && (
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Días restantes</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {license.days_remaining} días
                    </p>
                  </div>
                )}
              </div>

              {(isExpired || isRevoked) && (
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
                  onClick={() => router.push('/license/acquire')}
                >
                  Renovar licencia
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Key className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Sin licencia registrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {status?.licenses_required
                    ? 'Necesitas una licencia para usar la app.'
                    : 'La app está en modo abierto, no necesitas licencia por ahora.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending request */}
        {status?.pending_request && (
          <Card className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="flex items-start gap-3 py-4">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Solicitud en revisión</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enviaste una solicitud de licencia {status.pending_request.plan_type === 'monthly' ? 'mensual' : 'anual'} el{' '}
                  {new Date(status.pending_request.created_at).toLocaleDateString('es-CO')}.
                  Te notificaremos pronto.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        {!status?.pending_request && !isActive && (
          <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-6 text-center space-y-3">
            <p className="font-semibold">¿Listo para activar tu acceso?</p>
            <p className="text-sm text-muted-foreground">
              Completa el formulario y te enviaremos el catálogo de precios al correo.
            </p>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
              onClick={() => router.push('/license/acquire')}
            >
              Adquirir licencia
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
