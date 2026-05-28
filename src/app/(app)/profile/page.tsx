'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Relationship { name: string; relation: string; notes: string }

interface ProfileForm {
  personal:      { city: string; country: string; birthdate: string; occupation: string; marital_status: string; children: string }
  health:        { allergies: string; conditions: string; medications: string; blood_type: string; fitness_goals: string }
  preferences:   { diet: string; favorite_foods: string; disliked_foods: string; hobbies: string; music: string; sports: string }
  routines:      { wake_time: string; sleep_time: string; work_schedule: string; exercise_frequency: string; exercise_type: string }
  relationships: Relationship[]
  goals:         { short_term: string; long_term: string; savings_goal: string }
}

const empty: ProfileForm = {
  personal:      { city: '', country: '', birthdate: '', occupation: '', marital_status: '', children: '' },
  health:        { allergies: '', conditions: '', medications: '', blood_type: '', fitness_goals: '' },
  preferences:   { diet: '', favorite_foods: '', disliked_foods: '', hobbies: '', music: '', sports: '' },
  routines:      { wake_time: '', sleep_time: '', work_schedule: '', exercise_frequency: '', exercise_type: '' },
  relationships: [],
  goals:         { short_term: '', long_term: '', savings_goal: '' },
}

const toStr = (v: unknown) => Array.isArray(v) ? v.join(', ') : (v as string) ?? ''
const toArr = (s: string)  => s.split(',').map(v => v.trim()).filter(Boolean)

function apiToForm(data: Record<string, unknown>): ProfileForm {
  const p = (data.personal  as Record<string, unknown>) ?? {}
  const h = (data.health    as Record<string, unknown>) ?? {}
  const pr = (data.preferences as Record<string, unknown>) ?? {}
  const r = (data.routines  as Record<string, unknown>) ?? {}
  const g = (data.goals     as Record<string, unknown>) ?? {}
  return {
    personal:    { city: String(p.city ?? ''), country: String(p.country ?? ''), birthdate: String(p.birthdate ?? ''), occupation: String(p.occupation ?? ''), marital_status: String(p.marital_status ?? ''), children: String(p.children ?? '') },
    health:      { allergies: toStr(h.allergies), conditions: toStr(h.conditions), medications: toStr(h.medications), blood_type: String(h.blood_type ?? ''), fitness_goals: toStr(h.fitness_goals) },
    preferences: { diet: String(pr.diet ?? ''), favorite_foods: toStr(pr.favorite_foods), disliked_foods: toStr(pr.disliked_foods), hobbies: toStr(pr.hobbies), music: toStr(pr.music), sports: toStr(pr.sports) },
    routines:    { wake_time: String(r.wake_time ?? ''), sleep_time: String(r.sleep_time ?? ''), work_schedule: String(r.work_schedule ?? ''), exercise_frequency: String(r.exercise_frequency ?? ''), exercise_type: String(r.exercise_type ?? '') },
    relationships: (data.relationships as Relationship[]) ?? [],
    goals:       { short_term: toStr(g.short_term), long_term: toStr(g.long_term), savings_goal: String(g.savings_goal ?? '') },
  }
}

function formToApi(form: ProfileForm) {
  return {
    personal:    { ...form.personal, children: form.personal.children ? parseInt(form.personal.children) : 0 },
    health:      { blood_type: form.health.blood_type, allergies: toArr(form.health.allergies), conditions: toArr(form.health.conditions), medications: toArr(form.health.medications), fitness_goals: toArr(form.health.fitness_goals) },
    preferences: { diet: form.preferences.diet, favorite_foods: toArr(form.preferences.favorite_foods), disliked_foods: toArr(form.preferences.disliked_foods), hobbies: toArr(form.preferences.hobbies), music: toArr(form.preferences.music), sports: toArr(form.preferences.sports) },
    routines:    form.routines,
    relationships: form.relationships,
    goals:       { savings_goal: form.goals.savings_goal, short_term: toArr(form.goals.short_term), long_term: toArr(form.goals.long_term) },
  }
}

function Field({ label, hint, value, onChange, placeholder, type = 'text' }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function ProfilePage() {
  const [form, setForm]   = useState<ProfileForm>(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      if (data && Object.keys(data).length) setForm(apiToForm(data))
    })
  }, [])

  const up = <K extends keyof ProfileForm>(section: K) =>
    (key: string, value: string) =>
      setForm(f => ({ ...f, [section]: { ...(f[section] as object), [key]: value } }))

  const addRel = () => setForm(f => ({ ...f, relationships: [...f.relationships, { name: '', relation: '', notes: '' }] }))
  const updateRel = (i: number, key: keyof Relationship, v: string) =>
    setForm(f => { const r = [...f.relationships]; r[i] = { ...r[i], [key]: v }; return { ...f, relationships: r } })
  const removeRel = (i: number) =>
    setForm(f => ({ ...f, relationships: f.relationships.filter((_, idx) => idx !== i) }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await api.put('/profile', formToApi(form))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Mi Perfil personal</h1>
          <p className="text-sm text-muted-foreground">Tu asistente usa esta información para conocerte y ayudarte mejor en cada interacción</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Personal */}
          <Card>
            <CardHeader><CardTitle className="text-base">👤 Datos personales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ciudad" value={form.personal.city} onChange={v => up('personal')('city', v)} placeholder="Bogotá" />
                <Field label="País" value={form.personal.country} onChange={v => up('personal')('country', v)} placeholder="Colombia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha de nacimiento" value={form.personal.birthdate} onChange={v => up('personal')('birthdate', v)} placeholder="1990-05-15" type="date" />
                <Field label="Ocupación" value={form.personal.occupation} onChange={v => up('personal')('occupation', v)} placeholder="Desarrollador de software" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Estado civil" value={form.personal.marital_status} onChange={v => up('personal')('marital_status', v)} placeholder="soltero, casado..." />
                <Field label="Hijos" value={form.personal.children} onChange={v => up('personal')('children', v)} placeholder="0" type="number" />
              </div>
            </CardContent>
          </Card>

          {/* Salud */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏥 Salud</CardTitle>
              <CardDescription>Información crítica para recomendaciones seguras y personalizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Alergias" hint="Separadas por coma" value={form.health.allergies} onChange={v => up('health')('allergies', v)} placeholder="mariscos, nueces, penicilina" />
              <Field label="Condiciones médicas" hint="Separadas por coma" value={form.health.conditions} onChange={v => up('health')('conditions', v)} placeholder="diabetes tipo 2, hipertensión" />
              <Field label="Medicamentos actuales" hint="Separados por coma" value={form.health.medications} onChange={v => up('health')('medications', v)} placeholder="metformina 500mg" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de sangre" value={form.health.blood_type} onChange={v => up('health')('blood_type', v)} placeholder="O+" />
                <Field label="Metas de salud" hint="Coma separado" value={form.health.fitness_goals} onChange={v => up('health')('fitness_goals', v)} placeholder="bajar 5kg, correr 5km" />
              </div>
            </CardContent>
          </Card>

          {/* Preferencias */}
          <Card>
            <CardHeader><CardTitle className="text-base">❤️ Preferencias</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Tipo de dieta" value={form.preferences.diet} onChange={v => up('preferences')('diet', v)} placeholder="omnívoro, vegetariano, vegano..." />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Comidas favoritas" hint="Coma separado" value={form.preferences.favorite_foods} onChange={v => up('preferences')('favorite_foods', v)} placeholder="pizza, sushi, arepas" />
                <Field label="Comidas que no le gustan" hint="Coma separado" value={form.preferences.disliked_foods} onChange={v => up('preferences')('disliked_foods', v)} placeholder="cilantro, hígado" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hobbies e intereses" hint="Coma separado" value={form.preferences.hobbies} onChange={v => up('preferences')('hobbies', v)} placeholder="programar, videojuegos, leer" />
                <Field label="Música favorita" hint="Géneros o artistas" value={form.preferences.music} onChange={v => up('preferences')('music', v)} placeholder="rock, electrónica" />
              </div>
              <Field label="Deportes" hint="Coma separado" value={form.preferences.sports} onChange={v => up('preferences')('sports', v)} placeholder="fútbol, ciclismo, natación" />
            </CardContent>
          </Card>

          {/* Rutinas */}
          <Card>
            <CardHeader><CardTitle className="text-base">⏰ Rutinas diarias</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Me despierto a las" value={form.routines.wake_time} onChange={v => up('routines')('wake_time', v)} placeholder="07:00" type="time" />
                <Field label="Me duermo a las" value={form.routines.sleep_time} onChange={v => up('routines')('sleep_time', v)} placeholder="23:00" type="time" />
              </div>
              <Field label="Horario de trabajo" value={form.routines.work_schedule} onChange={v => up('routines')('work_schedule', v)} placeholder="09:00-18:00" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Frecuencia de ejercicio" value={form.routines.exercise_frequency} onChange={v => up('routines')('exercise_frequency', v)} placeholder="3 veces/semana" />
                <Field label="Tipo de ejercicio" value={form.routines.exercise_type} onChange={v => up('routines')('exercise_type', v)} placeholder="gimnasio, correr, yoga..." />
              </div>
            </CardContent>
          </Card>

          {/* Relaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">👥 Personas importantes</CardTitle>
              <CardDescription>Familia, amigos y contactos clave para tu asistente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.relationships.map((rel, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nombre" value={rel.name} onChange={v => updateRel(i, 'name', v)} placeholder="María" />
                    <Field label="Relación" value={rel.relation} onChange={v => updateRel(i, 'relation', v)} placeholder="madre, amigo, jefe..." />
                  </div>
                  <Field label="Notas" value={rel.notes} onChange={v => updateRel(i, 'notes', v)} placeholder="cumpleaños 15 de marzo, alérgica al maní" />
                  <button type="button" onClick={() => removeRel(i)} className="text-xs text-destructive hover:underline">Eliminar</button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRel}
                className="w-full rounded-lg border border-dashed border-primary py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
              >
                + Agregar persona
              </button>
            </CardContent>
          </Card>

          {/* Metas */}
          <Card>
            <CardHeader><CardTitle className="text-base">🎯 Metas y objetivos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Metas a corto plazo" hint="Separadas por coma" value={form.goals.short_term} onChange={v => up('goals')('short_term', v)} placeholder="terminar proyecto X, aprender React Native" />
              <Field label="Metas a largo plazo" hint="Separadas por coma" value={form.goals.long_term} onChange={v => up('goals')('long_term', v)} placeholder="comprar casa, iniciar empresa" />
              <Field label="Meta de ahorro" value={form.goals.savings_goal} onChange={v => up('goals')('savings_goal', v)} placeholder="viaje a Europa, fondo de emergencia" />
            </CardContent>
          </Card>

          <Separator />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar perfil'}
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Perfil guardado</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
