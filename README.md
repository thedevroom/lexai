# LexAI v2

Despacho digital de inteligencia artificial jurídica en español. Plataforma SaaS premium con consultas multi-área, memoria de expedientes, análisis documental, generación de escritos y panel de administración.

## Características

- **9 áreas jurídicas** especializadas (laboral, civil, penal, fiscal, familia, consumidor, tráfico, extranjería, mercantil)
- **Orquestador IA** con razonamiento IRAC, disclaimers RGPD y fallback local sin API
- **Dashboard** con chat, expedientes, documentos y escritos
- **Panel admin** con gestión de usuarios y auditoría
- **Marketing y legal** listos para producción: demo interactiva, cookies, términos, privacidad, aviso legal
- **Seguridad**: cifrado AES-256-GCM, registros de consentimiento, exportación/borrado de datos

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React, Tailwind CSS, Framer Motion |
| API | Fastify, tRPC, Prisma, BullMQ |
| Base de datos | PostgreSQL 16 |
| Caché / colas | Redis 7 (fallback en memoria en desarrollo) |
| IA | xAI API (opcional) + motor local |
| Monorepo | Turborepo + pnpm |

## Requisitos

- **Node.js** ≥ 22
- **pnpm** ≥ 9 (recomendado 10)
- **Docker** (opcional, para Postgres/Redis/MinIO)
- Sin Docker: PostgreSQL embebido vía `embedded-postgres`

## Inicio rápido

### Opción A — Un solo comando (recomendado)

```bash
pnpm install
copy .env.example .env   # Windows
# cp .env.example .env    # macOS / Linux

pnpm start
```

`pnpm start` ejecuta preflight (lint, typecheck, test, build), levanta PostgreSQL embebido, aplica migraciones, seed y arranca web + API.

- **Web:** http://localhost:3000
- **API:** http://localhost:4000/health

### Opción B — Desarrollo manual

```bash
pnpm install
copy .env.example .env

# Base de datos embebida (sin Docker)
pnpm db:local          # terminal 1
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev               # terminal 2
```

### Opción C — Docker Compose

```bash
pnpm install
copy .env.example .env
pnpm docker:up
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

## Cuentas de desarrollo

Tras `pnpm db:seed`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@lexai.es` | `AdminLexAI2026!` |
| Usuario demo | `demo@lexai.es` | `DemoLexAI2026!` |

Cambia estas credenciales antes de desplegar en producción.

## Scripts principales

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Servidores de desarrollo (web + API) |
| `pnpm dev:full` | DB embebida + dev en un proceso |
| `pnpm start` | Preflight + DB + migrate + seed + dev + smoke |
| `pnpm preflight` | lint + typecheck + test + build |
| `pnpm smoke` | Pruebas de humo en runtime (API/web) |
| `pnpm db:local` | PostgreSQL embebido local |
| `pnpm db:migrate` | Migraciones en desarrollo |
| `pnpm db:migrate:deploy` | Migraciones en CI/producción |
| `pnpm db:seed` | Datos iniciales |
| `pnpm docker:up` | Infraestructura Docker |

## Estructura del monorepo

```
apps/
  web/          → Frontend Next.js (marketing, dashboard, admin, legal)
  api/          → Backend Fastify + tRPC + Prisma
packages/
  shared/       → Tipos, esquemas Zod, constantes legales
  ai/           → Orquestador y agentes jurídicos
  design-tokens/→ Tokens de diseño CSS
  test-utils/   → Utilidades de testing
docker/         → Docker Compose y Dockerfiles
scripts/        → Arranque, smoke tests, utilidades
docs/           → Arquitectura, desarrollo, cumplimiento legal
```

## Variables de entorno

Copia `.env.example` a `.env`. Las variables críticas para desarrollo local:

- `DATABASE_URL` — conexión PostgreSQL
- `NEXTAUTH_SECRET` / `JWT_SECRET` — autenticación
- `XAI_API_KEY` — opcional; sin clave usa motor local

Documentación completa en [`.env.example`](./.env.example) y [docs/xai-integration.md](./docs/xai-integration.md).

## Producción

- Build web: `output: 'standalone'` en `apps/web/next.config.ts`
- Dockerfiles: `docker/Dockerfile.api`, `docker/Dockerfile.web`
- CI: `.github/workflows/ci.yml` (lint, typecheck, test, build)
- SEO: `robots.ts`, `sitemap.ts`

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Guía de desarrollo](./docs/DEVELOPMENT.md)
- [Cumplimiento legal / RGPD](./docs/legal-compliance.md)
- [Integración xAI](./docs/xai-integration.md)
- [Contribuir](./CONTRIBUTING.md)

## Licencia

Código propietario — ver [LICENSE](./LICENSE).

---

Repositorio: [github.com/cristianq2020/lexai](https://github.com/cristianq2020/lexai)