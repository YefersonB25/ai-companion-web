'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { LicenseSetting } from '@/types'
import { Settings2, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LicenseSettingsPage() {
  const [settings, setSettings] = useState<LicenseSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    licenses_required: false,
    whatsapp_number: '',
    price_monthly_cop: 50000,
    price_yearly_cop: 480000,
    license_features: [] as string[],
  })

  useEffect(() => {
    api.get<LicenseSetting>('/admin/license/settings')
      .then(({ data }) => {
        setSettings(data)
        setForm({
          licenses_required: data.licenses_required,
          whatsapp_number: data.whatsapp_number ?? '',
          price_monthly_cop: data.price_monthly_cop,
          price_yearly_cop: data.price_yearly_cop,
          license_features: data.license_features ?? [],
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const { data } = await api.put<LicenseSetting>('/admin/license/settings', form)
      setSettings(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateFeature = (i: number, val: string) => {
    const feats = [...form.license_features]
    feats[i] = val
    setForm(f => ({ ...f, license_features: feats }))
  }

  const addFeature = () => setForm(f => ({ ...f, license_features: [...f.license_features, ''] }))
  const removeFeature = (i: number) => setForm(f => ({ ...f, license_features: f.license_features.filter((_, idx) => idx !== i) }))

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">

      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-indigo-500" />
          Configuración de Licencias
        </h1>
        <p className="text-muted-foreground text-sm">
          Activa o desactiva el requisito de licencia y configura los precios.
        </p>
      </div>

      {/* Master toggle */}
      <Card className={form.licenses_required ? 'border-indigo-300 dark:border-indigo-800' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Requerir licencia</CardTitle>
              <CardDescription className="mt-1">
                Cuando está activo, los usuarios deben tener una licencia válida para usar la app.
                La app seguirá funcionando normalmente hasta que lo actives.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, licenses_required: !f.licenses_required }))}
              className="shrink-0 ml-4"
            >
              {form.licenses_required ? (
                <ToggleRight className="h-10 w-10 text-indigo-500" />
              ) : (
                <ToggleLeft className="h-10 w-10 text-muted-foreground" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant={form.licenses_required ? 'default' : 'secondary'} className={form.licenses_required ? 'bg-indigo-600 hover:bg-indigo-600' : ''}>
            {form.licenses_required ? '🔒 Licencias requeridas — APP PROTEGIDA' : '🔓 App abierta — sin licencia requerida'}
          </Badge>
        </CardContent>
      </Card>

      {/* Prices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Precios (COP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Plan Mensual (COP/mes)</Label>
              <Input
                type="number"
                min={0}
                value={form.price_monthly_cop}
                onChange={e => setForm(f => ({ ...f, price_monthly_cop: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                ${form.price_monthly_cop.toLocaleString('es-CO')} COP/mes
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Plan Anual (COP/año)</Label>
              <Input
                type="number"
                min={0}
                value={form.price_yearly_cop}
                onChange={e => setForm(f => ({ ...f, price_yearly_cop: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                ${form.price_yearly_cop.toLocaleString('es-CO')} COP/año ·{' '}
                Ahorro: ${((form.price_monthly_cop * 12) - form.price_yearly_cop).toLocaleString('es-CO')} COP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp de contacto</CardTitle>
          <CardDescription>
            Número al que se enviarán las solicitudes de licencia. Incluye el código de país (ej: 573001234567).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="573001234567"
            value={form.whatsapp_number}
            onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Características incluidas</CardTitle>
          <CardDescription>
            Listado que aparece en el email de catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.license_features.map((feat, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={feat}
                onChange={e => updateFeature(i, e.target.value)}
                placeholder={`Característica ${i + 1}`}
              />
              <Button variant="ghost" size="icon" onClick={() => removeFeature(i)} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive">
                ×
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFeature} className="w-full">
            + Agregar característica
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar configuración
        </Button>
        {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">✓ Guardado</p>}
      </div>
    </div>
  )
}
