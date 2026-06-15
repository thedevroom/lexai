# Arquitectura — LexAI v2

## Visión general

LexAI es un monorepo Turborepo que separa la experiencia de usuario (Next.js), la lógica de negocio y persistencia (Fastify + tRPC + Prisma) y el razonamiento jurídico (paquete `@lexai/ai`).

```
┌─────────────────────────────────────────────────────────────┐
│  apps/web (Next.js 15)                                      │
│  Marketing · Dashboard · Admin · Legal · PWA                │
└──────────────────────────┬──────────────────────────────────┘
                           │ tRPC / REST
┌──────────────────────────▼──────────────────────────────────┐
│  apps/api (Fastify)                                         │
│  Auth · Cases · Consultations · Documents · Compliance      │
│  Admin · Billing · Voice (base)                             │
└──────┬───────────────────────────────┬──────────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌────────────────┐
│ PostgreSQL   │              │ Redis / BullMQ │
│ (Prisma)     │              │ rate limit     │
└──────────────┘              └────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  packages/ai — LexAIOrchestrator                            │
│  Clasificación · Routing xAI · Fallback local · IRAC      │
└─────────────────────────────────────────────────────────────┘
```

## Paquetes

### `apps/web`

- **App Router** con rutas públicas (landing, producto, legal) y protegidas (`AuthGuard`, `AdminGuard`)
- **tRPC client** tipado hacia la API
- **Design system** basado en tokens (`@lexai/design-tokens`) y componentes reutilizables
- **Demo interactiva** de producto en landing (`#demo`)

### `apps/api`

- **tRPC** como capa principal de API con contexto de sesión, IP y user-agent
- **Prisma** para modelos: usuarios, expedientes, consultas, documentos, consentimientos, auditoría
- **Middleware** de rate limiting, anti-abuso y roles (`USER`, `ADMIN`)
- **Servicios** desacoplados: IA de consultas, almacenamiento R2/MinIO, cifrado, colas

### `packages/ai`

- **LexAIOrchestrator**: clasifica la consulta, elige área jurídica y modelo
- **9 prompts** de sistema por área (`*.system.md`)
- **xAI client** opcional con degradación a motor local (`lexai-local-fallback`)
- Salida validada con esquema `LegalResponse` (`@lexai/shared`)

### `packages/shared`

- Tipos de dominio, áreas legales, disclaimers y esquemas Zod compartidos entre API, web y AI

## Flujo de una consulta jurídica

1. El usuario envía mensaje desde el chat del dashboard
2. `consultations` router valida sesión y crea/actualiza el hilo
3. `consultation-ai` invoca al orquestador con contexto del expediente
4. El orquestador clasifica complejidad y área → xAI live o fallback local
5. La respuesta JSON (IRAC + citas + disclaimer) se persiste y se streaméa al cliente
6. Eventos de auditoría y consentimiento quedan registrados según RGPD

## Autenticación y roles

- **NextAuth** en web; JWT en API para llamadas directas
- Rol `ADMIN` habilita `/admin`, gestión de usuarios y logs de auditoría
- Seed crea admin y usuario demo en desarrollo

## Infraestructura local

| Modo | Postgres | Redis | Almacenamiento |
|------|----------|-------|----------------|
| Embebido | `embedded-postgres` | Memoria (fallback) | `.local-storage/` |
| Docker | `docker-compose` | Redis 7 | MinIO |

Scripts de arranque en `scripts/start-project.mjs` y `scripts/dev-with-db.mjs`.

## Seguridad y cumplimiento

- Cifrado **AES-256-GCM** para campos sensibles y documentos privilegiados
- Router `compliance`: consentimientos, exportación y borrado de datos
- Páginas legales y banner de cookies alineados con LSSI/RGPD
- Ver [legal-compliance.md](./legal-compliance.md)

## CI/CD

- **CI** (`.github/workflows/ci.yml`): lint, typecheck, test con Postgres/Redis de servicio, build
- **E2E** (`.github/workflows/e2e.yml`): Playwright nocturno (workflow_dispatch disponible)

## Decisiones técnicas

| Decisión | Motivo |
|----------|--------|
| tRPC end-to-end | Tipado compartido y menos boilerplate REST |
| Monorepo pnpm | Dependencias internas (`workspace:*`) y builds cacheados con Turbo |
| Fallback IA local | Desarrollo sin coste API y resiliencia en producción |
| PostgreSQL embebido | Onboarding sin Docker en Windows/macOS/Linux |