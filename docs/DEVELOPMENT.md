# Development Guide — LexAI v2

## Local environment

```bash
pnpm install
copy .env.example .env   # Windows
pnpm start               # full startup with validations
```

For a step-by-step walkthrough, see the [README](../README.md).

## Code conventions

### TypeScript

- `strict: true` — avoid `any`
- Validate external inputs with **Zod**
- Prefer `import type { ... }` for type-only imports

### File structure

| Area | Location |
|------|----------|
| Prisma models | `apps/api/prisma/schema.prisma` |
| tRPC routers | `apps/api/src/trpc/routers/` |
| API services | `apps/api/src/services/` |
| AI orchestrator | `packages/ai/src/orchestrator/` |
| Legal prompts | `packages/ai/src/prompts/*.system.md` |
| UI components | `apps/web/src/components/` |
| App Router pages | `apps/web/src/app/` |
| Design tokens | `packages/design-tokens/src/tokens.css` |
| Inline tRPC route | `apps/web/src/app/api/trpc/[...path]/route.ts` |

### Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(web): add cookie consent banner
fix(api): handle redis connection fallback
docs: update architecture diagram
chore(ci): align pnpm version with packageManager
```

### Legal AI

- Outputs must conform to the `LegalResponse` schema
- **IRAC** methodology is mandatory for structured responses
- Reinforced disclaimers in **CRIMINAL** and **TAX** areas
- Confidence &lt; 0.7 → expanded disclaimer and recommendation to consult a human lawyer

### Design

- Dark theme: background `#0A0A0A`, gold accent `#C5A46E`
- Typography: Inter Tight, Inter, Playfair Display
- Animations with Framer Motion; respect `prefers-reduced-motion`
- Target **WCAG 2.2 AA** compliance

## Testing

```bash
pnpm test          # Vitest across all packages
pnpm preflight     # lint + typecheck + test + build
pnpm smoke         # runtime smoke tests (API + web running)
```

- Unit and integration tests with **Vitest**
- CI does not call the live xAI API (mocks / local engine)
- E2E with Playwright in `apps/web` (nightly workflow)

## Database

```bash
pnpm db:generate          # Prisma client
pnpm db:migrate           # create new migration in dev
pnpm db:migrate:deploy    # apply in CI/prod
pnpm db:seed              # demo data + admin user
pnpm db:studio            # Prisma Studio
```

Embedded PostgreSQL: `pnpm db:local` (data stored in `apps/api/.embedded-db/`, gitignored).

## Environment & secrets

- Never commit `.env` or real API keys
- Template available in `.env.example`
- To enable live AI: set `XAI_API_KEY` in `.env`
- Generate secrets: `openssl rand -base64 32`

### Local vs production tRPC

| Environment | tRPC mode | Trigger |
|-------------|-----------|---------|
| Local dev | Fastify on `:4000` or inline | `DATABASE_URL` with `localhost` → separate API |
| Vercel + Neon | Inline at `/api/trpc` | Cloud `DATABASE_URL` → no `API_URL` needed |

## Quality before PR

```bash
pnpm preflight
pnpm format:check
```

## Internal roadmap

| Module | Status |
|--------|--------|
| Schema + migrations + seed | Complete |
| Backend tRPC (auth, cases, docs, compliance) | Complete |
| Orchestrator + 9 legal areas | Complete |
| Marketing frontend + dashboard | Complete |
| Admin panel + audit logs | Complete |
| GDPR security + encryption | Complete |
| Docker + CI | Complete |
| Inline tRPC on Vercel | Complete |
| Voice (LiveKit + Twilio) | In progress |
| Extended Playwright E2E | Pending |

## Common blockers

| Problem | Solution |
|---------|----------|
| Port 4000/3000 in use | `pnpm start` frees ports; or kill processes manually |
| Prisma error without Postgres | Use `pnpm db:local` or `pnpm docker:up` |
| Redis unavailable | API falls back to in-memory (warning in logs) |
| No xAI credits | Local engine responds automatically |
| Vercel 503 on tRPC | Ensure `DATABASE_URL` is set to a cloud Postgres URL |