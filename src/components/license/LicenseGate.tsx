'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import type { LicenseStatus } from '@/types'
import { Key, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LicenseGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [status, setStatus] = useState<LicenseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get<LicenseStatus>('/license/status')
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If enforcement is off OR user has active license OR is admin → let through
  if (!status?.licenses_required || status?.has_active_license || user?.is_admin) {
    return <>{children}</>
  }

  // Blocked: show license required wall
  const license = status.license
  const isExpired = license && !license.is_active

  return (
    <div className="flex h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
          {isExpired ? (
            <AlertTriangle className="h-8 w-8 text-white" />
          ) : (
            <Key className="h-8 w-8 text-white" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isExpired ? 'Tu licencia ha vencido' : 'Licencia requerida'}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isExpired
              ? `Tu licencia venció el ${new Date(license.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}. Renuévala para seguir usando AI Companion.`
              : 'Para acceder a AI Companion necesitas una licencia de activación. Adquiere la tuya y continúa usando tu asistente personal.'}
          </p>
        </div>

        {status.pending_request && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20 px-4 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              ⏳ Tu solicitud de licencia está en revisión. Te notificaremos pronto.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold"
            onClick={() => router.push('/license/acquire')}
          >
            {isExpired ? 'Renovar licencia' : 'Adquirir licencia'}
          </Button>
          {status.pending_request ? null : (
            <Button variant="outline" size="sm" onClick={() => router.push('/license')}>
              Ver estado de mi licencia
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          ¿Ya tienes licencia?{' '}
          <button
            className="underline text-indigo-500 hover:text-indigo-600"
            onClick={() => {
              // Reload to re-check
              setLoading(true)
              api.get<LicenseStatus>('/license/status')
                .then(({ data }) => setStatus(data))
                .finally(() => setLoading(false))
            }}
          >
            Verificar nuevamente
          </button>
        </p>
      </div>
    </div>
  )
}
