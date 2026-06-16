# Deployment — LexAI v2

## Production architecture

LexAI supports two deployment modes:

| Mode | When to use | Components |
|------|-------------|------------|
| **Vercel + Neon (recommended)** | Single-platform deploy, fastest setup | Next.js + inline tRPC + Neon Postgres |
| **Split architecture** | Dedicated API server, custom infra | Vercel (web) + Railway/Render/Docker (API) |

### Recommended: Vercel with inline tRPC

When `DATABASE_URL` (or `POSTGRES_PRISMA_URL`) points to a **cloud-hosted** PostgreSQL instance, the Next.js app runs tRPC **inline** via `/api/trpc` serverless routes. The full dashboard works without a separate Fastify server or `API_URL`.

```mermaid
flowchart LR
  User --> Vercel["Vercel · apps/web"]
  Vercel --> TRPC["/api/trpc · inline handler"]
  TRPC --> Neon[("Neon Postgres")]
  TRPC --> Redis[("Upstash Redis · optional")]
```

| Component | Platform | Notes |
|-----------|----------|-------|
| **Web + API** (`apps/web`) | [Vercel](https://vercel.com) | Next.js 15, inline tRPC at `/api/trpc` |
| **PostgreSQL** | [Neon](https://neon.tech), Supabase, Railway | Prisma migrations run at build time |
| **Redis** | Upstash, Railway | Optional — in-memory fallback for rate limiting |

> **No `API_URL` required** when using a cloud `DATABASE_URL`. The app auto-detects inline mode via `useInlineTrpc()` in `apps/web/src/lib/api-config.ts`.

---

## Vercel + Neon Postgres

### Option A — Deploy button

Use the **Deploy with Vercel** button in the README or:

[Import repository](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fthedevroom%2Flexai&project-name=lexai&root-directory=apps%2Fweb)

### Option B — CLI

```bash
npm i -g vercel
cd lexai
vercel link
vercel env add DATABASE_URL production
vercel env add WEB_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add ENCRYPTION_MASTER_KEY production
vercel --prod
```

### Project settings

| Field | Value |
|-------|-------|
| Root Directory | `apps/web` |
| Framework | Next.js |
| Install Command | `cd ../.. && pnpm install --frozen-lockfile` |
| Build Command | `cd ../.. && pnpm db:generate && pnpm --filter @lexai/api build && pnpm db:migrate:deploy && pnpm db:bootstrap:prod && pnpm --filter @lexai/web build` |
| Node.js Version | 22.x |

The build pipeline automatically:

1. Generates the Prisma client
2. Compiles the API package (shared tRPC router)
3. Runs `prisma migrate deploy` against your Neon database
4. Bootstraps production defaults via `db:bootstrap:prod`
5. Builds the Next.js app

### Environment variables (Vercel)

#### Required — inline tRPC mode

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://user:pass@ep-xxx.neon.tech/lexai?sslmode=require` | Neon Postgres connection string |
| `WEB_URL` | `https://your-app.vercel.app` | Public URL of the web app |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | JWT/cookie signing secret |
| `NEXTAUTH_URL` | Same as `WEB_URL` | NextAuth callback URL |
| `ENCRYPTION_MASTER_KEY` | `openssl rand -base64 32` | AES-256-GCM master key for PII |

#### Optional

| Variable | Example | Description |
|----------|---------|-------------|
| `REDIS_URL` | `rediss://...@upstash.io` | Rate limiting & job queues (falls back to in-memory) |
| `XAI_API_KEY` | `xai-...` | Live Grok responses (local engine used if unset) |
| `JWT_SECRET` | `openssl rand -base64 32` | API JWT signing (defaults to `NEXTAUTH_SECRET`) |
| `R2_*` | Cloudflare R2 credentials | Document storage in production |
| `STRIPE_*` | Stripe keys | Billing (if enabled) |

#### Not needed for inline mode

| Variable | When required instead |
|----------|----------------------|
| `API_URL` | Only when using a **separate** Fastify server (split architecture) |

### Connect Neon Postgres

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (enable **pooled** connection for serverless)
3. In Vercel → **Settings** → **Environment Variables**, add `DATABASE_URL`
4. Redeploy — migrations run automatically during build

### Connect GitHub (auto-deploy)

1. Install the [Vercel GitHub app](https://github.com/apps/vercel) on the `thedevroom` account
2. Vercel Dashboard → **lexai** → **Settings** → **Git** → Connect `thedevroom/lexai`
3. Root Directory: `apps/web`
4. Production branch: `main` — every push deploys automatically

### Live demo

| Environment | URL |
|-------------|-----|
| **Production** | https://lexai-bay.vercel.app |
| **Repository** | https://github.com/thedevroom/lexai |

---

## Split architecture (optional)

Use this when you need a dedicated, always-on API server instead of Vercel serverless functions.

### Docker

```bash
docker build -f docker/Dockerfile.api -t lexai-api .
docker run -p 4000:4000 --env-file .env lexai-api
```

### Critical API variables

```env
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_SECRET=...
ENCRYPTION_MASTER_KEY=...
XAI_API_KEY=...          # optional
```

### Frontend proxy mode

When deploying the API separately, set `API_URL` in Vercel to your Fastify server URL. The Next.js `/api/trpc` route will **proxy** requests to the external API instead of running inline.

```env
API_URL=https://api.your-domain.com
```

Redeploy the frontend after updating `API_URL`.

---

## Database

```bash
pnpm db:migrate:deploy    # apply migrations (also runs in Vercel build)
pnpm db:bootstrap:prod    # production bootstrap (also runs in Vercel build)
pnpm db:seed              # development/staging only
```

> **Do not** run `db:seed` in production — it creates demo credentials.

---

## Generate production secrets

```bash
# One-time setup script
node scripts/setup-production-secrets.mjs
```

Or manually:

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # ENCRYPTION_MASTER_KEY
```

---

## Social preview (GitHub)

1. Repo → **Settings** → **General** → **Social preview**
2. Upload `.github/assets/banner.png` (1280×640 recommended)

The README includes the banner for link previews when sharing.

---

## Pre-production checklist

- [ ] Rotate demo credentials from seed (never use in production)
- [ ] `DATABASE_URL` points to Neon (or other cloud Postgres)
- [ ] `WEB_URL` and `NEXTAUTH_URL` match your Vercel domain
- [ ] `ENCRYPTION_MASTER_KEY` and `NEXTAUTH_SECRET` are unique, random values
- [ ] HTTPS on all endpoints (automatic on Vercel)
- [ ] Secrets stored only in environment variables — never in code
- [ ] CI passing (`pnpm preflight`)
- [ ] `API_URL` unset (inline mode) or correctly set (split mode)