'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  getIntegrations,
  connectGoogle,
  disconnectGoogle,
  type Integration,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plug, Calendar, Mail, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react'

interface Banner {
  type: 'success' | 'error'
  message: string
}

export default function IntegrationsSection() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [google, setGoogle] = useState<Integration | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [banner, setBanner] = useState<Banner | null>(null)

  const loadIntegrations = useCallback(async (withSpinner = false) => {
    if (withSpinner) setLoading(true)
    try {
      const { data } = await getIntegrations()
      const g = data.integrations?.find((i) => i.provider === 'google') ?? null
      setGoogle(g)
    } catch {
      setBanner({ type: 'error', message: 'No se pudieron cargar las integraciones.' })
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial del estado de las integraciones
  useEffect(() => {
    getIntegrations()
      .then(({ data }) => {
        setGoogle(data.integrations?.find((i) => i.provider === 'google') ?? null)
      })
      .catch(() => {
        setBanner({ type: 'error', message: 'No se pudieron cargar las integraciones.' })
      })
      .finally(() => setLoading(false))
  }, [])

  // Maneja el retorno desde el consentimiento de Google (?google=connected|error)
  useEffect(() => {
    const status = searchParams.get('google')
    if (!status) return

    // El backend devuelve un código de error genérico (?google=error&code=...),
    // nunca el detalle crudo de Google (eso queda en logs server-side).
    const code = searchParams.get('code')
    const errorMessages: Record<string, string> = {
      access_denied: 'Cancelaste la autorización en Google.',
      oauth_failed: 'No se pudo conectar la cuenta de Google. Intenta de nuevo.',
    }
    // Limpia los query params de la URL y muestra el aviso tras el repintado
    router.replace('/settings', { scroll: false })
    const id = setTimeout(() => {
      if (status === 'connected') {
        setBanner({ type: 'success', message: 'Cuenta de Google conectada correctamente.' })
      } else if (status === 'error') {
        setBanner({
          type: 'error',
          message: (code && errorMessages[code]) || 'No se pudo conectar la cuenta de Google.',
        })
      }
    }, 0)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const { data } = await connectGoogle()
      if (data?.url) {
        window.location.href = data.url
      } else {
        setBanner({ type: 'error', message: 'No se recibió la URL de autorización de Google.' })
        setConnecting(false)
      }
    } catch {
      setBanner({ type: 'error', message: 'No se pudo iniciar la conexión con Google.' })
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('¿Seguro que quieres desconectar tu cuenta de Google? Aria dejará de acceder a tu Calendar y Gmail.')) {
      return
    }
    setDisconnecting(true)
    try {
      await disconnectGoogle()
      setBanner({ type: 'success', message: 'Cuenta de Google desconectada.' })
      await loadIntegrations(true)
    } catch {
      setBanner({ type: 'error', message: 'No se pudo desconectar la cuenta de Google.' })
    } finally {
      setDisconnecting(false)
    }
  }

  const connected = !!google?.connected

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Integraciones</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Conecta cuentas externas para que tu asistente acceda a tus datos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aviso de éxito / error */}
        {banner && (
          <div
            className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
              banner.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {banner.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-snug">{banner.message}</p>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tarjeta Google */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <GoogleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium leading-tight">Google</p>
                {!loading && connected && (
                  google?.expired ? (
                    <Badge variant="destructive">Token expirado</Badge>
                  ) : (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      Conectado
                    </Badge>
                  )
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Calendar
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Gmail
                </span>
              </p>
              {!loading && connected && google?.account_email && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {google.account_email}
                </p>
              )}
              {!loading && connected && google?.expired && (
                <p className="text-[11px] text-destructive mt-1 leading-snug">
                  El acceso caducó. Reconecta tu cuenta para seguir usando Calendar y Gmail.
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {loading ? (
              <div className="flex h-8 items-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : connected ? (
              <div className="flex items-center gap-2">
                {google?.expired && (
                  <Button
                    type="button"
                    variant="default"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reconectar'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desconectar'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Conectar Google'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
