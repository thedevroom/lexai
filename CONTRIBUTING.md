# Contributing to LexAI

Thank you for your interest in the project. This guide summarizes the workflow for contributing in an organized way.

## Prerequisites

- Node.js ≥ 22
- pnpm ≥ 9
- Git

## Setup

```bash
git clone https://github.com/thedevroom/lexai.git
cd lexai
pnpm install
copy .env.example .env
pnpm start
```

## Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
2. Implement changes with tests where applicable
3. Run `pnpm preflight` before opening a PR
4. Open a Pull Request with a clear description: what, why, and how to test

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope):` new feature
- `fix(scope):` bug fix
- `docs:` documentation
- `chore:` maintenance, dependencies
- `test:` tests
- `ci:` pipelines

Example: `feat(web): add admin audit log table`

## Code standards

- Strict TypeScript — avoid unnecessary `any`
- Validate inputs with Zod
- Do not include secrets or `.env` files
- Respect design tokens and WCAG 2.2 AA accessibility
- AI responses must conform to `LegalResponse` and IRAC methodology

## Reporting issues

Include:

- Steps to reproduce
- Expected vs actual behavior
- Node/pnpm version and OS
- Relevant logs (no personal data or API keys)

Use the [bug report template](https://github.com/thedevroom/lexai/issues/new?template=bug_report.yml) or [feature request template](https://github.com/thedevroom/lexai/issues/new?template=feature_request.yml).

## Security

If you discover a vulnerability, do **not** open a public issue. Contact **buildwithme1@proton.me**.