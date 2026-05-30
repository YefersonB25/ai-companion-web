# AI Companion — Frontend Web (Next.js)

Interfaz web del asistente personal **Aria**. Chat con streaming SSE, mapa mental, gestión de proveedores, tema claro/oscuro y panel de administración exclusivo para desarrolladores.

---

## Stack

| | Tecnología |
|--|------------|
| Framework | Next.js 16 (App Router) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Estado | Zustand (persistente en localStorage) |
| HTTP | Axios |
| WebSockets | Laravel Echo + Pusher JS (Reverb) |
| Auth | Sanctum tokens (Bearer) |
| Tema | next-themes (claro/oscuro/sistema) |
| Charts | Recharts (panel admin) |
| Markdown | react-markdown + remark-gfm + @tailwindcss/typography |

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Backend en `http://ai-companion.test`

### Instalación

```bash
git clone https://github.com/YefersonB25/ai-companion-web.git
cd ai-companion-web
npm install
```

### Variables de entorno (.env.local)

```env
NEXT_PUBLIC_API_URL=http://ai-companion.test/api
NEXT_PUBLIC_REVERB_APP_KEY=tu_reverb_app_key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

**Producción** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://ai.omnirepair.online/api
NEXT_PUBLIC_REVERB_APP_KEY=tu_reverb_app_key
NEXT_PUBLIC_REVERB_HOST=ai.omnirepair.online
NEXT_PUBLIC_REVERB_PORT=443
NEXT_PUBLIC_REVERB_SCHEME=https
```

### Arrancar

```bash
npm run dev   # http://localhost:3000
```

---

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/chat` | Chat — saludo personalizado + 6 sugerencias con descripción |
| `/chat/[id]` | Conversación con scroll completo, markdown rendering, streaming |
| `/memory` | Mapa mental de nodos de memoria (React Flow) |
| `/providers` | Gestión de proveedores IA |
| `/settings` | Configuración con 5 tabs (General/Voz/Dispositivo/Briefing/Asistente) |
| `/profile` | Perfil personal |
| `/download` | Descarga app Android |
| `/admin` | Dashboard admin — solo `is_admin=true` |
| `/admin/users` | Usuarios con brain score |
| `/admin/users/[id]` | Detalle + red neural del cerebro del usuario |
| `/admin/memory` | Cerebro global con red neural SVG |

---

## Sidebar

- **Colapsable**: botón `‹` para modo icono, `›` para expandir
- **Búsqueda**: filtra conversaciones en tiempo real
- **Agrupación por fecha**: Hoy / Ayer / Últimos 7 días / Últimos 30 días / Anteriores
- **Toggle de tema**: 🌙/☀/🖥 cicla Oscuro → Claro → Sistema (persiste automáticamente)
- **Link Admin**: visible solo para `is_admin=true`

---

## Panel de Administración

Accesible en `/admin`. Solo para usuarios admin creados via seeder o `php artisan app:make-admin`.

### Secciones

| Sección | Descripción |
|---------|-------------|
| Dashboard | Stats globales, gráficas de actividad, insights IA on-demand |
| Usuarios | Tabla con brain score (0-100), skeleton loaders, overflow-x responsive |
| Detalle usuario | Gráfica de crecimiento del cerebro, red neural SVG, memorias recientes |
| Cerebro Global | Red neural global, distribución por tipo, top etiquetas, ranking usuarios |

### Red Neural SVG

Visualización del cerebro con SVG puro + animaciones CSS (`<animate>`):
- Sin `requestAnimationFrame` — no causa crash de navegador
- Nodos agrupados por tipo con colores, tamaño = importancia
- Conexiones con animación de "hormigas marchando"
- Nodos con pulso CSS, tooltip al hover

### API `/admin/memory` — estructura real

```json
{
  "total_nodes": 16,
  "total_users_with_memory": 1,
  "avg_nodes_per_user": 16,
  "growth_by_day": [{ "date": "...", "count": 16, "cumulative": 16 }],
  "by_type": { "note": 6, "person": 4, "preference": 3 },
  "top_labels": [{ "label": "...", "count": 1 }]
}
```
> `by_type` es `Record<string, number>` — el frontend lo convierte a array para gráficos.

---

## Notas técnicas importantes

**Scroll en flex layouts:**
```css
/* SIEMPRE usar min-h-0 en flex items que deben scrollear */
.flex-1.min-h-0.overflow-y-auto { }  /* ✅ funciona */
.flex-1.overflow-y-auto { }          /* ❌ no scrollea */
```

**Dynamic import para componentes con canvas/DOM:**
```tsx
const NeuralBrainGraph = dynamic(
  () => import('@/components/admin/NeuralBrainGraph'),
  { ssr: false }  // evita crash en SSR
)
```

**Markdown rendering en mensajes del asistente:**
```tsx
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {message.content}
</ReactMarkdown>
```

---

## Seguridad implementada

- API key de proveedores: `type="password"`, `autoComplete="new-password"`, limpia tras guardar
- Rutas admin: redirect a `/chat` si `!user.is_admin`
- Feedback visual en errores de API (ya no solo `console.error`)
- Banner de desconexión cuando Reverb cae

---

## Deploy

**Nunca editar archivos directamente en el servidor.**

```bash
# Local
git push origin main

# Servidor
ssh root@134.122.21.84
deploy web
```

El script ejecuta: `git pull` → `npm ci` → `npm run build` → reinicia Next.js.

```bash
deploy rollback web             # commit anterior
deploy rollback web abc1234     # commit específico
```

---

## Producción

| | |
|--|--|
| URL | `https://ai.omnirepair.online` |
| Proceso | `ai-companion-web` (Supervisor, puerto 3000) |
| Logs | `tail -f /var/log/ai-companion-web.log` |
| Nginx | Proxea `/api/*` → Laravel PHP, resto → Next.js:3000 |
