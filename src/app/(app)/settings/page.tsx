'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { UserSetting } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sparkles, GraduationCap, Target, Palette, Truck } from 'lucide-react'

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<UserSetting>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data ?? {}))
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
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Configuración</h1>
          <p className="text-sm text-muted-foreground">Personaliza tu asistente de IA</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Idioma</label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comportamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comportamiento</CardTitle>
              <CardDescription>Configura cómo responde tu asistente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'memory_enabled', label: 'Memoria activada', desc: 'El asistente recuerda información sobre ti entre conversaciones' },
                { key: 'auto_title', label: 'Títulos automáticos', desc: 'Genera títulos automáticamente para nuevas conversaciones' },
                { key: 'stream_responses', label: 'Respuestas en tiempo real', desc: 'Muestra la respuesta mientras se genera (streaming)' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => update(key as keyof UserSetting, !settings[key as keyof UserSetting])}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      settings[key as keyof UserSetting] ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      settings[key as keyof UserSetting] ? 'left-4.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Briefing diario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Briefing diario</CardTitle>
              <CardDescription>Tu asistente te envía cada mañana un resumen personalizado con clima, recordatorios y más</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activar briefing matutino</p>
                  <p className="text-xs text-muted-foreground">Recibe tu resumen personalizado cada mañana</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('briefing_enabled', !settings.briefing_enabled)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    settings.briefing_enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    settings.briefing_enabled ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {settings.briefing_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Hora de envío</label>
                    <Input
                      type="time"
                      value={settings.briefing_time ?? '08:00'}
                      onChange={(e) => update('briefing_time', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Ciudad para el clima</label>
                    <Input
                      value={settings.briefing_city ?? ''}
                      onChange={(e) => update('briefing_city', e.target.value)}
                      placeholder="Ej: Bogotá, Madrid, Miami..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Persona */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Persona del asistente</CardTitle>
              <CardDescription>Define cómo se comporta y comunica tu asistente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Templates */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Templates rápidos
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
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-muted ${
                          isActive ? 'border-primary bg-primary/5' : 'bg-card'
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-tight">{tpl.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            {tpl.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={(settings.persona as { name?: string })?.name ?? ''}
                  onChange={(e) => update('persona', { ...(settings.persona as object ?? {}), name: e.target.value })}
                  placeholder="Ej: Aria, Max, Luna..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prompt del sistema</label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[160px] resize-y font-mono"
                  value={(settings.persona as { prompt?: string })?.prompt ?? ''}
                  onChange={(e) => update('persona', { ...(settings.persona as object ?? {}), prompt: e.target.value })}
                  placeholder="Eres un asistente personal experto en tecnología y logística..."
                />
                <p className="text-[11px] text-muted-foreground">
                  Este prompt se añade al prompt base del sistema. Personaliza el comportamiento y conocimiento que el asistente debe tener sobre ti.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">Guardado</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
