# AI Companion — Frontend Web (Next.js)

Interfaz web del asistente personal de IA. Chat con streaming SSE, mapa mental de memoria, gestión de proveedores y configuración.

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
| `/chat` | Chat principal (nueva conversación) |
| `/chat/[id]` | Conversación específica |
| `/memory` | Mapa mental de nodos de memoria |
| `/providers` | Gestión de proveedores IA |
| `/settings` | Configuración del usuario |
| `/profile` | Perfil personal |

---

## Deploy

**Nunca editar archivos directamente en el servidor.** Todo cambio viene de git.

### Flujo de trabajo

```bash
# 1. En tu máquina: hacer cambios, commit y push
git add .
git commit -m "feat: descripción"
git push origin main

# 2. En el servidor:
ssh root@134.122.21.84
deploy web
```

El script ejecuta: `git pull` → `npm ci` → `npm run build` → reinicia proceso Next.js.

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
