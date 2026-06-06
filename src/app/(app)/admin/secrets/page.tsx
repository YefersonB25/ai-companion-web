'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { adminApi, type Secret, type SecretStatus, type SecretInput } from '@/lib/adminApi'
import {
  KeyRound, Loader2, Plus, Pencil, Trash2, ExternalLink, ShieldAlert,
  CheckCircle2, XCircle, RotateCw, X, Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────
const STATUS_OPTIONS: { value: SecretStatus; label: string }[] = [
  { value: 'active', label: 'Activa' },
  { value: 'needs_rotation', label: 'Requiere rotación' },
  { value: 'deprecated', label: 'Obsoleta' },
]

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toDateInput(dateStr: string | null) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function StatusBadge({ status }: { status: SecretStatus }) {
  if (status === 'needs_rotation')
    return (
      <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
        <ShieldAlert className="h-3 w-3 mr-1" />
        Requiere rotación
      </Badge>
    )
  if (status === 'deprecated')
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Obsoleta
      </Badge>
    )
  return (
    <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Activa
    </Badge>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function AdminSecretsPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  const [secrets, setSecrets] = useState<Secret[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appFilter, setAppFilter] = useState<string>('')

  // Edición / creación
  const [editing, setEditing] = useState<Secret | 'new' | null>(null)
  const [form, setForm] = useState<SecretInput>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Borrado
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (user && !user.is_admin) router.replace('/chat')
  }, [user, router])

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getSecrets()
      .then(({ data }) => { setSecrets(data.secrets); setError(null) })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los secretos. Verifica tu conexión.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const apps = useMemo(() => {
    if (!secrets) return []
    return Array.from(new Set(secrets.map(s => s.app).filter(Boolean))) as string[]
  }, [secrets])

  // Agrupado por app (respetando sort_order luego env_var) + filtro
  const grouped = useMemo(() => {
    if (!secrets) return []
    const filtered = appFilter ? secrets.filter(s => s.app === appFilter) : secrets
    const sorted = [...filtered].sort((a, b) => {
      const ao = a.sort_order ?? 9999
      const bo = b.sort_order ?? 9999
      if (ao !== bo) return ao - bo
      return a.env_var.localeCompare(b.env_var)
    })
    const map = new Map<string, Secret[]>()
    for (const s of sorted) {
      const key = s.app || 'Sin app'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return Array.from(map.entries())
  }, [secrets, appFilter])

  // ── Form open helpers ──
  const openEdit = (s: Secret) => {
    setEditing(s)
    setFormError(null)
    setForm({
      env_var: s.env_var,
      label: s.label,
      app: s.app,
      provider: s.provider,
      description: s.description,
      used_in: s.used_in,
      rotation_url: s.rotation_url,
      last_rotated_at: toDateInput(s.last_rotated_at),
      status: s.status,
      notes: s.notes ?? '',
      sort_order: s.sort_order ?? null,
    })
  }

  const openNew = () => {
    setEditing('new')
    setFormError(null)
    setForm({
      env_var: '',
      label: '',
      app: appFilter || '',
      provider: '',
      description: '',
      used_in: '',
      rotation_url: '',
      last_rotated_at: '',
      status: 'active',
      notes: '',
      sort_order: null,
    })
  }

  const closeForm = () => { setEditing(null); setForm({}); setFormError(null) }

  const handleSave = async () => {
    if (editing === 'new' && !form.env_var?.trim()) {
      setFormError('La variable de entorno (env_var) es obligatoria.')
      return
    }
    setSaving(true)
    setFormError(null)
    const payload: SecretInput = {
      ...form,
      last_rotated_at: form.last_rotated_at || null,
      sort_order: form.sort_order != null && `${form.sort_order}` !== '' ? Number(form.sort_order) : null,
    }
    try {
      if (editing === 'new') {
        await adminApi.createSecret(payload)
      } else if (editing) {
        await adminApi.updateSecret(editing.id, payload)
      }
      closeForm()
      load()
    } catch (err) {
      console.error(err)
      setFormError('No se pudo guardar. Revisa los campos e intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await adminApi.deleteSecret(id)
      setConfirmDeleteId(null)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-6xl w-full mx-auto">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-20 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-indigo-500" />
            Secretos / Keys
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Documentación de las keys del proyecto: dónde viven y dónde se usan.
          </p>
        </div>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-1" />
          Añadir registro
        </Button>
      </div>

      {/* Aviso de seguridad */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30 p-4 text-sm text-indigo-800 dark:text-indigo-300 flex gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <p>
          Esta vista <strong>NO muestra ni almacena los valores</strong> de las keys; solo
          documenta dónde viven y se usan. Los valores reales están únicamente en el{' '}
          <code className="font-mono">.env</code> del servidor.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Filtro por app */}
      {apps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Filtrar por app:</span>
          <button
            onClick={() => setAppFilter('')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              appFilter === '' ? 'bg-indigo-600 text-white' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
            )}
          >
            Todas
          </button>
          {apps.map(a => (
            <button
              key={a}
              onClick={() => setAppFilter(a)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                appFilter === a ? 'bg-indigo-600 text-white' : 'bg-muted hover:bg-muted/70 text-muted-foreground'
              )}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {!error && secrets && secrets.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <KeyRound className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Aún no hay keys documentadas</p>
          <Button onClick={openNew} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-1" />
            Añadir la primera
          </Button>
        </div>
      )}

      {grouped.map(([appName, items]) => (
        <div key={appName} className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Badge variant="outline">{appName}</Badge>
            <span className="text-xs text-muted-foreground font-normal">{items.length} key{items.length !== 1 ? 's' : ''}</span>
          </h2>

          {items.map(s => {
            const needsRotation = s.status === 'needs_rotation'
            return (
              <div
                key={s.id}
                className={cn(
                  'rounded-xl border p-5',
                  needsRotation
                    ? 'border-amber-300 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20'
                    : ''
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{s.label || s.env_var}</span>
                      <StatusBadge status={s.status} />
                      {s.provider && <Badge variant="outline">{s.provider}</Badge>}
                    </div>

                    {/* env_var */}
                    <code className="inline-block text-xs font-mono bg-muted rounded px-1.5 py-0.5">
                      {s.env_var}
                    </code>

                    {/* Config status */}
                    <div className="text-sm">
                      {s.configured ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Configurada{s.last4 ? ` · …${s.last4}` : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Falta en el servidor
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {s.description && (
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                    )}

                    {/* Used in */}
                    {s.used_in && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Se usa en:</span> {s.used_in}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                      <span>Última rotación: {formatDate(s.last_rotated_at)}</span>
                      {s.rotation_url && (
                        <a
                          href={s.rotation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          <RotateCw className="h-3 w-3" />
                          Rotar
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    {confirmDeleteId === s.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="destructive" className="h-8 text-xs flex-1"
                          onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                        >
                          {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirmar'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setConfirmDeleteId(null)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm" variant="outline"
                        className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => setConfirmDeleteId(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Borrar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Modal edición / creación */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeForm}
        >
          <div
            className="bg-background rounded-xl border shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-background">
              <h2 className="font-semibold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-500" />
                {editing === 'new' ? 'Nuevo registro de key' : 'Editar metadatos'}
              </h2>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                Los valores viven en el <code className="font-mono">.env</code> del servidor;
                aquí solo se documentan. No hay campo para el valor de la key.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Variable de entorno (env_var) {editing === 'new' && '*'}</Label>
                  <Input
                    className="h-9 font-mono text-sm"
                    placeholder="TELEGRAM_BOT_TOKEN"
                    value={form.env_var ?? ''}
                    onChange={e => setForm(f => ({ ...f, env_var: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Etiqueta</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Token del bot de Telegram"
                    value={form.label ?? ''}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">App</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="ai-companion"
                    value={form.app ?? ''}
                    onChange={e => setForm(f => ({ ...f, app: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Proveedor</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Telegram"
                    value={form.provider ?? ''}
                    onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Estado</Label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status ?? 'active'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as SecretStatus }))}
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    className="text-sm min-h-[60px]"
                    placeholder="Para qué sirve esta key"
                    value={form.description ?? ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Dónde se usa (used_in)</Label>
                  <Textarea
                    className="text-sm min-h-[60px]"
                    placeholder="app/Services/TelegramService.php, webhook /telegram"
                    value={form.used_in ?? ''}
                    onChange={e => setForm(f => ({ ...f, used_in: e.target.value }))}
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">URL de rotación</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="https://..."
                    value={form.rotation_url ?? ''}
                    onChange={e => setForm(f => ({ ...f, rotation_url: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Última rotación</Label>
                  <Input
                    type="date"
                    className="h-9 text-sm"
                    value={form.last_rotated_at ?? ''}
                    onChange={e => setForm(f => ({ ...f, last_rotated_at: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Orden (sort_order)</Label>
                  <Input
                    type="number"
                    className="h-9 text-sm"
                    placeholder="0"
                    value={form.sort_order ?? ''}
                    onChange={e => setForm(f => ({ ...f, sort_order: e.target.value === '' ? null : Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Notas internas</Label>
                  <Textarea
                    className="text-sm min-h-[50px]"
                    placeholder="Notas opcionales"
                    value={form.notes ?? ''}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 p-5 border-t sticky bottom-0 bg-background">
              <Button variant="ghost" onClick={closeForm} disabled={saving}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
