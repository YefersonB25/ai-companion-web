# AI Companion — Frontend Web (Next.js)

Interfaz web del asistente personal de IA. Chat con streaming SSE, mapa mental de memoria, gestión de proveedores, panel de administración con analytics y visualización del cerebro.

---

## Stack

| | Tecnología |
|--|------------|
| Framework | Next.js 16 (App Router) |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Estado | Zustand (persistente en localStorage) |
| HTTP | Axios + React Query |
| WebSockets | Laravel Echo + Pusher JS (Reverb) |
| Auth | Sanctum tokens (Bearer) |
| Tema | next-themes (claro/oscuro/sistema) |
| Charts | Recharts (panel admin) |

---

## Desarrollo local

### Requisitos
- Node.js 20+
- Backend corriendo en `http://ai-companion.test`

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
| `/chat` | Chat principal — saludo personalizado, sugerencias |
| `/chat/[id]` | Conversación con scroll completo de historial |
| `/memory` | Mapa mental de nodos de memoria |
| `/providers` | Gestión de proveedores IA |
| `/settings` | Configuración: comportamiento, voz, personas |
| `/profile` | Perfil personal |
| `/download` | Descarga de la app Android |
| `/admin` | Panel admin — dashboard (solo `is_admin=true`) |
| `/admin/users` | Lista de usuarios con brain score |
| `/admin/users/[id]` | Detalle de usuario + red neural del cerebro |
| `/admin/memory` | Cerebro global con red neural SVG |

---

## Sidebar

- **Colapsable** — botón `‹` para modo icono, `›` para expandir
- **Búsqueda** — filtra conversaciones en tiempo real
- **Agrupación por fecha** — Hoy / Ayer / Últimos 7 días / Últimos 30 días / Anteriores
- **Toggle de tema** — 🌙/☀/🖥 cicla entre Oscuro / Claro / Sistema
- **Link Admin** — visible solo para usuarios `is_admin=true`

---

## Panel de Administración

Accesible en `/admin`. Solo visible para usuarios con `is_admin=true` en la base de datos (creado via seeder o `php artisan app:make-admin`).

### Secciones

| Sección | URL | Descripción |
|---------|-----|-------------|
| Dashboard | `/admin` | Stats globales, gráficas de actividad, insights IA |
| Usuarios | `/admin/users` | Lista con brain score, actividad, memorias |
| Detalle usuario | `/admin/users/[id]` | Gráfica de crecimiento del cerebro, red neural SVG |
| Cerebro Global | `/admin/memory` | Red neural global, distribución por tipo, top etiquetas |

### Red Neural SVG
La visualización del cerebro usa SVG puro con animaciones CSS (`<animate>`):
- Sin `requestAnimationFrame` — no causa crash de navegador
- Nodos agrupados por tipo de memoria con colores
- Conexiones con animación de "hormigas marchando"
- Nodos con pulso CSS suave
- Tooltip al hover con detalle del nodo

---

## Deploy

**Nunca editar archivos directamente en el servidor.**

### Flujo

```bash
# 1. Commit y push local
git add . && git commit -m "feat: ..." && git push origin main

# 2. En el servidor
ssh root@134.122.21.84
deploy web
```

El script ejecuta: `git pull` → `npm ci` → `npm run build` → reinicia Next.js.

### Revertir

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
| Nginx | Proxea `/api/*` → Laravel, resto → Next.js :3000 |
