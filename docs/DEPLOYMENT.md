# Despliegue — LexAI v2

## Arquitectura de producción

| Componente | Plataforma recomendada | Notas |
|------------|------------------------|-------|
| **Frontend** (`apps/web`) | [Vercel](https://vercel.com) | Next.js 15, edge-ready |
| **API** (`apps/api`) | Railway, Render, Fly.io, Docker | Fastify + tRPC |
| **PostgreSQL** | Neon, Supabase, Railway | Prisma migrations |
| **Redis** | Upstash, Railway | Rate limit + BullMQ |

La demo en Vercel sirve **marketing, landing y UI estática**. El dashboard completo requiere la API desplegada y `API_URL` configurada.

---

## Vercel (frontend) + GitHub

### Opción A — Botón Deploy

Usa el botón **Deploy with Vercel** del README o:

[Importar repositorio](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthedevroom%2Flexai&project-name=lexai&root-directory=apps%2Fweb)

### Opción B — CLI

```bash
npm i -g vercel
cd lexai
vercel link
vercel env add WEB_URL production
vercel env add API_URL production
vercel --prod
```

### Configuración del proyecto

| Campo | Valor |
|-------|-------|
| Root Directory | `apps/web` |
| Framework | Next.js |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Build Command | `cd ../.. && pnpm --filter @lexai/web build` |
| Node.js Version | 22.x |

### Variables de entorno (Vercel)

| Variable | Ejemplo | Requerida |
|----------|---------|-----------|
| `WEB_URL` | `https://tu-dominio.vercel.app` | Sí |
| `API_URL` | `https://api.tu-dominio.com` | Sí (para dashboard) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Si usas auth |
| `NEXTAUTH_URL` | Igual que `WEB_URL` | Si usas auth |

### Producción actual

| Entorno | URL |
|---------|-----|
| **Demo live** | https://lexai-bay.vercel.app |
| **Proyecto Vercel** | `crid-s-projects1/lexai` |

### Conectar GitHub (auto-deploy)

1. Instala la app [Vercel en GitHub](https://github.com/apps/vercel) en la cuenta `thedevroom`
2. Vercel Dashboard → **lexai** → **Settings** → **Git** → Connect `thedevroom/lexai`
3. Root Directory: `apps/web` (ya configurado)
4. Production branch: `main` — cada push despliega automáticamente

---

## API (backend)

### Docker

```bash
docker build -f docker/Dockerfile.api -t lexai-api .
docker run -p 4000:4000 --env-file .env lexai-api
```

### Variables críticas API

```env
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_SECRET=...
ENCRYPTION_MASTER_KEY=...
XAI_API_KEY=...          # opcional
```

Tras desplegar la API, actualiza `API_URL` en Vercel y redeploy el frontend.

---

## Base de datos

```bash
pnpm db:migrate:deploy
pnpm db:seed   # solo desarrollo/staging
```

En producción **no** ejecutes seed con credenciales demo.

---

## Social preview (GitHub)

1. Repo → **Settings** → **General** → **Social preview**
2. Sube `.github/assets/banner.png` (1280×640 recomendado)

El README ya incluye el banner para vista previa al compartir enlaces.

---

## Checklist pre-producción

- [ ] Rotar credenciales demo del seed
- [ ] `WEB_URL` y `API_URL` correctos
- [ ] HTTPS en todos los endpoints
- [ ] Secretos solo en variables de entorno
- [ ] CI en verde (`pnpm preflight`)