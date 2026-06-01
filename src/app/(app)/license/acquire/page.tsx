'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { Sparkles, CheckCircle2, Loader2, ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type PlanType = 'monthly' | 'yearly'

export default function AcquireLicensePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [plan, setPlan] = useState<PlanType>('monthly')
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    company: '',
    city: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/license/request', { ...form, plan_type: plan })
      setSent(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr.response?.data?.message ?? 'Error al enviar la solicitud. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">¡Solicitud enviada!</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Revisa tu correo <strong>{form.email}</strong>. Te enviamos el catálogo de precios
              con los botones para adquirir tu licencia por WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white"
              onClick={() => router.push('/license')}
            >
              Ver estado de mi licencia
            </Button>
            <Button variant="outline" onClick={() => router.push('/chat')}>
              Volver al chat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              Adquiere tu licencia
            </h1>
            <p className="text-muted-foreground text-sm">
              Completa el formulario y te enviamos el catálogo de precios al correo
            </p>
          </div>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-4">
          {(['monthly', 'yearly'] as PlanType[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlan(p)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                plan === p
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-border hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{p === 'monthly' ? 'Mensual' : 'Anual'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p === 'monthly' ? 'Facturación mensual' : 'Facturación anual'}
                  </p>
                </div>
                {p === 'yearly' && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    AHORRO
                  </span>
                )}
              </div>
              <div className={`mt-2 h-1 rounded-full ${plan === p ? 'bg-indigo-500' : 'bg-transparent'}`} />
            </button>
          ))}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tus datos de contacto</CardTitle>
            <CardDescription>
              Te enviaremos el catálogo con los precios y opciones de pago a tu correo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                  <Input
                    id="phone"
                    placeholder="+57 300 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    placeholder="Bogotá, Medellín..."
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="company">Empresa / Organización</Label>
                  <Input
                    id="company"
                    placeholder="Nombre de tu empresa (opcional)"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar y recibir catálogo de precios
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Recibirás un correo con los precios y los botones para contactarnos por WhatsApp.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
