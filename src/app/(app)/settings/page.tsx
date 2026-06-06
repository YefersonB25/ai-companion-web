'use client'

import { Suspense, useEffect, useState } from 'react'
import api, { getTtsProviders } from '@/lib/api'
import IntegrationsSection from './IntegrationsSection'
import { UserSetting } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sparkles, GraduationCap, Target, Palette, Truck, Settings2, Brain, Clock, Bot, CheckCircle2, Plug, Mic, AudioLines } from 'lucide-react'

const TTS_PROVIDER_LABELS: Record<string, { label: string; desc: string }> = {
  gemini: { label: 'Gemini', desc: 'Voz multilingüe (español/inglés)' },
  elevenlabs: { label: 'ElevenLabs', desc: 'Voz premium' },
  openai: { label: 'OpenAI', desc: 'Voz neuronal' },
}

const PERSONA_TEMPLATES = [
  {
    key: 'personal',
    icon: Sparkles,
    name: 'Aria',
    title: 'Asistente Personal',
    description: 'Apoyo general en la vida diaria, decisiones, viajes, recordatorios',
    prompt: `Eres mi asistente personal de confianza. Conóceme bien y ayúdame con todo:

- Planificación: viajes, eventos, presupuestos, agenda
- Decisiones cotidianas: pros, contras, alternativas
- Redacción: emails, mensajes, propuestas
- Recordatorios y seguimiento de tareas pendientes

Habla en español, tono cálido y natural. Sé proactivo: si veo algo que pueda servirme, sugiérelo aunque no lo haya pedido. Recuerda mis preferencias entre conversaciones.`,
  },
  {
    key: 'tutor',
    icon: GraduationCap,
    name: 'Max',
    title: 'Tutor Técnico',
    description: 'Explicaciones técnicas profundas, code review, mentoring',
    prompt: `Eres mi tutor técnico. Asume que tengo conocimiento intermedio-avanzado:

- Explica conceptos yendo a la causa raíz, no superficial
- Cuando muestres código, da ejemplos completos y ejecutables con los imports
- Si hay múltiples enfoques, compara con el trade-off de cada uno
- Para errores, ayúdame a entender el "por qué" antes del "cómo"
- Recomienda recursos avanzados cuando aplique (RFCs, papers, libros)

Sé directo, sin floreos. Si pregunto algo mal planteado, corrige el planteamiento antes de responder.`,
  },
  {
    key: 'coach',
    icon: Target,
    name: 'Nova',
    title: 'Coach de Productividad',
    description: 'Hábitos, foco, metas, gestión del tiempo y energía',
    prompt: `Eres mi coach de productividad y bienestar. Ayúdame a:

- Definir metas claras y medibles, descomponerlas en pasos accionables
- Identificar bloqueos y patrones que limitan mi enfoque
- Establecer rutinas sostenibles (mañana, trabajo profundo, descanso)
- Hacer seguimiento honesto: pregúntame por compromisos previos
- Equilibrar trabajo, salud, relaciones y descanso

Tono motivador pero realista — sin frases vacías. Cuestiona cuando vea procrastinación o evasión.`,
  },
  {
    key: 'creative',
    icon: Palette,
    name: 'Luna',
    title: 'Asistente Creativo',
    description: 'Brainstorming, escritura, diseño conceptual, contenido',
    prompt: `Eres mi colaborador creativo. Ayúdame a:

- Generar ideas con cantidad y variedad (no me des solo una opción "segura")
- Pulir textos: emails, posts, narrativa, copy publicitario
- Explorar ángulos no obvios: "¿y si fuera al revés?", "¿qué pasaría si...?"
- Dar feedback honesto sobre mis ideas: qué funciona, qué no, por qué

Sé arriesgado en las propuestas. Si una idea es mediocre, dilo en lugar de halagarla.`,
  },
  {
    key: 'logistics',
    icon: Truck,
    name: 'Hermes',
    title: 'Soporte Logística',
    description: 'Transporte, rutas, operaciones, optimización de procesos',
    prompt: `Eres mi soporte para operaciones logísticas y de transporte. Trabajo en logística (Tractocar) y necesito:

- Análisis de rutas, costos por kilómetro, optimización de carga
- Cálculo de tarifas, márgenes, presupuestos para clientes
- Buenas prácticas: gestión de flota, mantenimiento, combustible, choferes
- Normativa de transporte de carga en Colombia (RNDC, manifiestos)
- Automatización de procesos repetitivos del negocio

Sé práctico y operativo. Cuando dudes de un dato (precio combustible, tarifa, normativa) verifícalo con web_search.`,
  },
]

interface ToggleProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-40 ${
        checked ? 'bg-indigo-600' : 'bg-muted-foreground/25'
      }`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<UserSetting>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Proveedores de voz (TTS)
  const [ttsProviders, setTtsProviders] = useState<string[] | null>(null)
  const [ttsDefault, setTtsDefault] = useState<string | null>(null)
  const [ttsLoading, setTtsLoading] = useState(true)
  const [ttsError, setTtsError] = useState(false)

  // Si volvemos del consentimiento de Google (?google=...), abre la pestaña Integraciones
  const [defaultTab] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('google')) {
      return 'integraciones'
    }
    return 'general'
  })

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data ?? {}))
  }, [])

  useEffect(() => {
    getTtsProviders()
      .then(({ data }) => {
        setTtsProviders(data.providers ?? [])
        setTtsDefault(data.default ?? null)
        // Solo fija la selección si el backend la trae; si no, dejamos que el
        // valor efectivo sea `default` sin marcar el setting como modificado.
        if (data.selected) {
          setSettings((s) => (s.tts_provider ? s : { ...s, tts_provider: data.selected }))
        }
      })
      .catch(() => setTtsError(true))
      .finally(() => setTtsLoading(false))
  }, [])

  const update = (key: keyof UserSetting, value: unknown) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await api.put('/settings', settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* Page header */}
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-sm px-6 py-5 sticky top-0 z-10">
        <div className="mx-auto w-full max-w-2xl flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Settings2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Configuración</h1>
            <p className="text-xs text-muted-foreground">Personaliza tu asistente de IA</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mx-auto w-full max-w-2xl space-y-5">
          <form onSubmit={handleSave} className="space-y-5">

            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="voz">Voz</TabsTrigger>
                <TabsTrigger value="dispositivo">Dispositivo</TabsTrigger>
                <TabsTrigger value="briefing">Briefing</TabsTrigger>
                <TabsTrigger value="asistente">Asistente</TabsTrigger>
                <TabsTrigger value="integraciones">
                  <Plug className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Integraciones</span>
                </TabsTrigger>
              </TabsList>

              {/* General tab — Idioma, zona horaria y comportamiento */}
              <TabsContent value="general">
                <div className="space-y-5">
                  {/* General */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold">General</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Ajustes básicos de idioma y región</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Idioma</label>
                          <select
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm transition-colors focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={settings.language ?? 'es'}
                            onChange={(e) => update('language', e.target.value)}
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Zona horaria</label>
                          <Input
                            value={settings.timezone ?? 'America/Bogota'}
                            onChange={(e) => update('timezone', e.target.value)}
                            placeholder="America/Bogota"
                            className="border-border/60 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/60"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comportamiento */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold">Comportamiento</CardTitle>
                      </div>
                      <CardDescription className="text-xs">Configura cómo responde tu asistente</CardDescription>
                    </CardHeader>
                    <CardContent className="divide-y divide-border/40">
                      {[
                        {
                          key: 'memory_enabled',
                          label: 'Memoria activada',
                          desc: 'El asistente recuerda información sobre ti entre conversaciones',
                        },
                        {
                          key: 'auto_title',
                          label: 'Títulos automáticos',
                          desc: 'Genera títulos automáticamente para nuevas conversaciones',
                        },
                        {
                          key: 'stream_responses',
                          label: 'Respuestas en tiempo real',
                          desc: 'Muestra la respuesta mientras se genera (streaming)',
                        },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="mr-6">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          </div>
                          <Toggle
                            checked={!!settings[key as keyof UserSetting]}
                            onChange={() => update(key as keyof UserSetting, !settings[key as keyof UserSetting])}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Voz tab */}
              <TabsContent value="voz">
                <div className="space-y-5">
                  {/* Proveedor de voz (TTS) */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AudioLines className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-semibold">Voz de Aria</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Elige con qué voz responde tu asistente cuando habla en voz alta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ttsLoading ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">Cargando proveedores de voz…</p>
                      ) : ttsError ? (
                        <p className="text-sm text-amber-600 py-6 text-center">
                          No se pudieron cargar los proveedores de voz. Inténtalo de nuevo más tarde.
                        </p>
                      ) : !ttsProviders || ttsProviders.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                          No hay proveedores de voz configurados todavía.
                        </p>
                      ) : (
                        (() => {
                          const current = settings.tts_provider ?? ttsDefault ?? ttsProviders[0]
                          return (
                            <div className="space-y-2">
                              {ttsProviders.length === 1 && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  Por ahora hay un único proveedor de voz disponible.
                                </p>
                              )}
                              {ttsProviders.map((provider) => {
                                const meta = TTS_PROVIDER_LABELS[provider] ?? { label: provider, desc: '' }
                                const isActive = current === provider
                                return (
                                  <button
                                    key={provider}
                                    type="button"
                                    onClick={() => update('tts_provider', provider)}
                                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150 ${
                                      isActive
                                        ? 'border-indigo-500/60 bg-indigo-500/5 shadow-sm shadow-indigo-500/10'
                                        : 'border-border/50 bg-card hover:border-indigo-500/30 hover:bg-muted/40'
                                    }`}
                                  >
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      isActive ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                                    }`}>
                                      <Mic className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium leading-tight">
                                        {meta.label}
                                        {provider === ttsDefault && (
                                          <span className="ml-2 text-[10px] font-normal text-muted-foreground uppercase tracking-wider">
                                            por defecto
                                          </span>
                                        )}
                                      </p>
                                      {meta.desc && (
                                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                                          {meta.desc}
                                        </p>
                                      )}
                                    </div>
                                    {isActive && (
                                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )
                        })()
                      )}
                    </CardContent>
                  </Card>

                  {/* Resto de configuración de voz (próximamente) */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Más opciones de voz</CardTitle>
                      <CardDescription className="text-xs">Activación por voz, velocidad, tono y overlay</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        {/* TODO: Implementar configuración de voz (activación, velocidad, tono, overlay) */}
                        Próximamente disponible.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Dispositivo tab */}
              <TabsContent value="dispositivo">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Dispositivo</CardTitle>
                    <CardDescription className="text-xs">Control del dispositivo y modo conducción</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      {/* TODO: Implementar control del dispositivo y modo conducción */}
                      Configuración de dispositivo próximamente disponible.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Briefing tab */}
              <TabsContent value="briefing">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">Briefing diario</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Tu asistente te envía cada mañana un resumen personalizado con clima, recordatorios y más
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="mr-6">
                        <p className="text-sm font-medium">Activar briefing matutino</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Recibe tu resumen personalizado cada mañana</p>
                      </div>
                      <Toggle
                        checked={!!settings.briefing_enabled}
                        onChange={() => update('briefing_enabled', !settings.briefing_enabled)}
                      />
                    </div>

                    {settings.briefing_enabled && (
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Hora de envío</label>
                          <Input
                            type="time"
                            value={settings.briefing_time ?? '08:00'}
                            onChange={(e) => update('briefing_time', e.target.value)}
                            className="border-border/60 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/60"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">Ciudad para el clima</label>
                          <Input
                            value={settings.briefing_city ?? ''}
                            onChange={(e) => update('briefing_city', e.target.value)}
                            placeholder="Ej: Bogotá, Madrid, Miami..."
                            className="border-border/60 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/60"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Asistente tab */}
              <TabsContent value="asistente">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-semibold">Persona del asistente</CardTitle>
                    </div>
                    <CardDescription className="text-xs">Define cómo se comporta y comunica tu asistente</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Templates */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                        Plantillas rápidas
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PERSONA_TEMPLATES.map((tpl) => {
                          const Icon = tpl.icon
                          const isActive = (settings.persona as { name?: string })?.name === tpl.name
                          return (
                            <button
                              key={tpl.key}
                              type="button"
                              onClick={() => update('persona', { name: tpl.name, prompt: tpl.prompt })}
                              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-150 ${
                                isActive
                                  ? 'border-indigo-500/60 bg-indigo-500/5 shadow-sm shadow-indigo-500/10'
                                  : 'border-border/50 bg-card hover:border-indigo-500/30 hover:bg-muted/40'
                              }`}
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isActive ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground'
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-tight">{tpl.title}</p>
                                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                                  {tpl.description}
                                </p>
                              </div>
                              {isActive && (
                                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <Separator className="opacity-50" />

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre del asistente</label>
                        <Input
                          value={(settings.persona as { name?: string })?.name ?? ''}
                          onChange={(e) => update('persona', { ...(settings.persona as object ?? {}), name: e.target.value })}
                          placeholder="Ej: Aria, Max, Luna..."
                          className="border-border/60 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/60"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Prompt del sistema</label>
                        <textarea
                          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm min-h-[180px] resize-y font-mono leading-relaxed transition-colors focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={(settings.persona as { prompt?: string })?.prompt ?? ''}
                          onChange={(e) => update('persona', { ...(settings.persona as object ?? {}), prompt: e.target.value })}
                          placeholder="Eres un asistente personal experto en tecnología y logística..."
                        />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Este prompt se añade al prompt base del sistema. Personaliza el comportamiento y conocimiento que el asistente debe tener sobre ti.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integraciones tab — Cuentas conectadas (Google Calendar + Gmail) */}
              <TabsContent value="integraciones">
                <Suspense fallback={null}>
                  <IntegrationsSection />
                </Suspense>
              </TabsContent>
            </Tabs>

            {/* Save bar */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Los cambios se aplican en la próxima conversación.
              </p>
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Guardado
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
