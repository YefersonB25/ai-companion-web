'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface VersionInfo {
  update_available: boolean
  version: string
  version_code: number
  changelog: string[]
  download_url: string | null
  is_required: boolean
}

export default function DownloadPage() {
  const [info, setInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'
    fetch(`${apiUrl}/app/version?platform=android&version_code=0`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-violet-950 to-indigo-950">
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-lg">
          🧠
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Companion</h1>
        <p className="text-white/60">Tu asistente personal de inteligencia artificial</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Android</CardTitle>
            {loading ? (
              <span className="text-sm text-muted-foreground">Cargando...</span>
            ) : info?.version ? (
              <Badge variant="secondary">v{info.version}</Badge>
            ) : null}
          </div>
          <CardDescription>
            Instala la app nativa en tu dispositivo Android
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && info?.changelog && info.changelog.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Novedades</p>
              <ul className="space-y-1">
                {info.changelog.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loading ? (
            <Button className="w-full" disabled>Cargando...</Button>
          ) : info?.download_url ? (
            <a
              href={info.download_url}
              download
              className={cn(buttonVariants(), 'w-full justify-center')}
            >
              Descargar APK{info.version ? ` v${info.version}` : ''}
            </a>
          ) : (
            <Button className="w-full" disabled>
              Próximamente
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Habilita &quot;Instalar de fuentes desconocidas&quot; en tu dispositivo
          </p>
        </CardContent>
      </Card>

      <p className="text-sm text-white/50">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-white/80 underline hover:text-white">
          Inicia sesión en la web
        </Link>
      </p>
    </div>
  )
}
