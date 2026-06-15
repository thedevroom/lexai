# Guía de desarrollo — LexAI v2

## Entorno local

```bash
pnpm install
copy .env.example .env   # Windows
pnpm start               # arranque completo con validaciones
```

Alternativa paso a paso: ver [README](../README.md).

## Convenciones de código

### TypeScript

- `strict: true`, evitar `any`
- Validación de entradas externas con **Zod**
- Preferir `import type { ... }` para tipos

### Estructura de archivos

| Área | Ubicación |
|------|-----------|
| Modelos Prisma | `apps/api/prisma/schema.prisma` |
| Routers tRPC | `apps/api/src/trpc/routers/` |
| Servicios API | `apps/api/src/services/` |
| Orquestador IA | `packages/ai/src/orchestrator/` |
| Prompts jurídicos | `packages/ai/src/prompts/*.system.md` |
| Componentes UI | `apps/web/src/components/` |
| Páginas App Router | `apps/web/src/app/` |
| Tokens de diseño | `packages/design-tokens/src/tokens.css` |

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(web): add cookie consent banner
fix(api): handle redis connection fallback
docs: update architecture diagram
chore(ci): align pnpm version with packageManager
```

### IA jurídica

- Salidas conformes al esquema `LegalResponse`
- Metodología **IRAC** obligatoria en respuestas estructuradas
- Disclaimers reforzados en áreas **PENAL** y **FISCAL**
- Confianza &lt; 0.7 → disclaimer ampliado y recomendación de abogado humano

### Diseño

- Tema oscuro: fondo `#0A0A0A`, acento oro `#C5A46E`
- Tipografías: Inter Tight, Inter, Playfair Display
- Animaciones con Framer Motion; respetar `prefers-reduced-motion`
- Objetivo **WCAG 2.2 AA**

## Testing

```bash
pnpm test          # Vitest en todos los paquetes
pnpm preflight     # lint + typecheck + test + build
pnpm smoke         # humo runtime (API + web levantados)
```

- Tests unitarios/integración con **Vitest**
- En CI no se llama a la API real de xAI (mocks / motor local)
- E2E con Playwright en `apps/web` (workflow nocturno)

## Base de datos

```bash
pnpm db:generate          # Prisma client
pnpm db:migrate             # nueva migración en dev
pnpm db:migrate:deploy      # aplicar en CI/prod
pnpm db:seed                # datos demo + admin
pnpm db:studio              # Prisma Studio
```

PostgreSQL embebido: `pnpm db:local` (datos en `apps/api/.embedded-db/`, ignorado por git).

## Variables y secretos

- Nunca commitear `.env` ni claves reales
- Plantilla en `.env.example`
- Para activar IA en vivo: `XAI_API_KEY` en `.env`
- Generar secretos: `openssl rand -base64 32`

## Calidad antes de PR

```bash
pnpm preflight
pnpm format:check
```

## Roadmap interno

| Módulo | Estado |
|--------|--------|
| Schema + migraciones + seed | Completo |
| Backend tRPC (auth, cases, docs, compliance) | Completo |
| Orquestador + 9 áreas jurídicas | Completo |
| Frontend marketing + dashboard | Completo |
| Panel admin + auditoría | Completo |
| Seguridad RGPD + cifrado | Completo |
| Docker + CI | Completo |
| Voz (LiveKit + Twilio) | En progreso |
| E2E Playwright ampliado | Pendiente |

## Bloqueos habituales

| Problema | Solución |
|----------|----------|
| Puerto 4000/3000 ocupado | `pnpm start` libera puertos; o cerrar procesos manualmente |
| Error Prisma sin Postgres | Usar `pnpm db:local` o `pnpm docker:up` |
| Redis no disponible | La API usa fallback en memoria (aviso en logs) |
| Sin créditos xAI | Motor local responde automáticamente |