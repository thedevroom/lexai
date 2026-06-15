# Changelog

All notable changes to LexAI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-15

### Added

- **Safe JSON handling** for tRPC and API proxy routes (`safe-json.ts`, `trpc-errors.ts`).
- Server-side tRPC proxy at `/api/trpc/[...path]` with plain-text error normalization.
- Health endpoint at `/api/health` reporting web and API status.
- `safeTrpcFetch` wrapper preventing `Unexpected token 'T', "The deploy"...` JSON parse crashes.
- JSON safety unit tests and `pnpm test:json-safety` integration script.
- Professional favicon system: SVG, PNG fallbacks, `site.webmanifest`, and Apple/Android icons.
- Comprehensive SEO: metadata, Open Graph, Twitter Cards, canonical URLs, JSON-LD structured data.
- Dynamic `sitemap.xml` and `robots.txt` generation.
- GSAP ScrollTrigger animations on landing page (problems, legal areas, comparison, pricing).
- `prefers-reduced-motion` support for all scroll animations.

### Changed

- Removed fragile Next.js rewrite for tRPC; requests now route through the API proxy.
- `GlassCard` accepts explicit `data-scroll` attribute; Framer entrance disabled when GSAP handles animation.
- Login and auth guard use `formatTrpcError` for user-friendly error messages.
- Vercel build configuration updated for monorepo (`db:generate` + web build).

### Fixed

- TypeScript errors in `glass-card.tsx` and `trpc.ts` (`exactOptionalPropertyTypes` compatibility).
- JSON parsing failures when Vercel or upstream APIs return plain-text deploy messages.
- Auth guard now surfaces API unavailability instead of silent failures.

### Security

- API URL placeholder detection via `isApiConfigured()` prevents proxying to invalid endpoints.
- tRPC proxy runs server-side only; credentials never exposed in client bundle.

## [0.1.0] - 2026-06-14

### Added

- Initial LexAI v2 monorepo: Next.js web app, Fastify API, shared packages.
- Landing page, login, dashboard, admin panel, and legal pages.
- tRPC + React Query client integration with JWT authentication.
- Prisma database layer with embedded SQLite for local development.
- Vercel deployment configuration and professional README.

[0.2.0]: https://github.com/thedevroom/lexai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/thedevroom/lexai/releases/tag/v0.1.0