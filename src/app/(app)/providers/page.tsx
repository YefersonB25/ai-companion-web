'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { AiProvider, SupportedProvider } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Star, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

const PROVIDER_ICONS: Record<string, string> = {
  claude: '🟣', openai: '🟢', deepseek: '🔵', gemini: '🔶', mistral: '🔴',
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<AiProvider[]>([])
  const [supported, setSupported] = useState<SupportedProvider[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ provider: 'gemini', model: 'gemini-2.0-flash', api_key: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const [p, s] = await Promise.all([api.get('/providers'), api.get('/providers/supported')])
    setProviders(p.data)
    setSupported(s.data.providers)
  }

  useEffect(() => { load() }, [])

  const handleProviderChange = (p: string) => {
    const models = supported.find((s) => s.name === p)?.models ?? []
    setForm({ provider: p, model: models[0] ?? '', api_key: '' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post('/providers', form)
      setShowForm(false)
      setForm({ provider: 'claude', model: 'claude-sonnet-4-6', api_key: '' })
      setForm(prev => ({ ...prev, api_key: '' }))
      await load()
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (id: number) => {
    await api.patch(`/providers/${id}`, { is_default: true })
    await load()
  }

  const toggleActive = async (p: AiProvider) => {
    await api.patch(`/providers/${p.id}`, { is_active: !p.is_active })
    await load()
  }

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await api.delete(`/providers/${id}`)
    await load()
  }

  const currentModels = supported.find((s) => s.name === form.provider)?.models ?? []

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Proveedores de IA</h1>
            <p className="text-sm text-muted-foreground">Gestiona tus API keys y modelos disponibles</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar proveedor
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nuevo proveedor</CardTitle>
              <CardDescription>Agrega una API key para activar un proveedor de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Proveedor</label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={form.provider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                    >
                      {supported.map((s) => (
                        <option key={s.name} value={s.name}>{PROVIDER_ICONS[s.name]} {s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Modelo</label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                    >
                      {currentModels.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Gemini inline guide */}
                {form.provider === 'gemini' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">🔶 Cómo obtener tu API key gratis</span>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">✨ GRATIS</Badge>
                    </div>
                    <div className="space-y-2">
                      {[
                        'Abre el enlace de abajo y presiona «Crear API Key»',
                        'Copia la clave generada (empieza con "AIza...")',
                        'Pégala en el campo API Key de abajo y guarda',
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-xs text-emerald-800 dark:text-emerald-300">{step}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ir a aistudio.google.com/apikey
                    </a>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder={form.provider === 'gemini' ? 'AIzaSy...' : 'sk-... o similar'}
                    value={form.api_key}
                    onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Provider list */}
        <div className="space-y-3">
          {providers.length === 0 && !showForm && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-900/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🔶</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">Google Gemini</h3>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0 text-[10px]">
                        ✨ GRATIS
                      </Badge>
                      <span className="text-xs text-muted-foreground">1,500 solicitudes/día · sin tarjeta</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      La forma más rápida de empezar. Obtén tu API key gratis en 1 minuto.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    'Abre el enlace de abajo y presiona «Crear API Key»',
                    'Copia la clave generada (empieza con "AIza...")',
                    'Regresa aquí, presiona «Agregar proveedor» y pégala',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-amber-800 dark:text-amber-300">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Obtener API key gratis → aistudio.google.com
                  </a>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Ya tengo mi key
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {providers.map((p) => (
            <Card key={p.id} className={!p.is_active ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4 py-4">
                <span className="text-2xl">{PROVIDER_ICONS[p.provider] ?? '🤖'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm capitalize">{p.provider}</span>
                    <Badge variant="outline" className="text-[10px]">{p.model}</Badge>
                    {p.is_default && (
                      <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">predeterminado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Prioridad: {p.priority}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive(p)}
                    title={p.is_active ? 'Desactivar' : 'Activar'}>
                    {p.is_active
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  {!p.is_default && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDefault(p.id)}
                      title="Establecer como predeterminado">
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
