# Initialize LexAI git repository with a professional commit history.
# Run from repo root: pwsh scripts/init-git-history.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (Test-Path .git) {
  Write-Host "Repository already initialized."
  exit 0
}

git init -b main
git config user.email "buildwithme1@proton.me"
git config user.name "Build With Me"

function Commit-Stage {
  param([string]$Message, [string[]]$Paths)
  git add @Paths
  git commit -m $Message
}

Commit-Stage "chore: bootstrap monorepo with Turborepo and pnpm" @(
  "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "turbo.json",
  "tsconfig.base.json", "eslint.config.js", ".prettierrc", ".gitignore", ".env.example"
)

Commit-Stage "feat(shared): add shared types, schemas and design tokens" @(
  "packages/shared", "packages/design-tokens", "packages/test-utils"
)

Commit-Stage "feat(ai): add legal orchestrator and area-specific prompts" @(
  "packages/ai"
)

Commit-Stage "feat(api): add Fastify backend with Prisma and tRPC" @(
  "apps/api"
)

Commit-Stage "feat(web): add Next.js frontend with marketing and dashboard" @(
  "apps/web"
)

Commit-Stage "chore(infra): add Docker, startup scripts and embedded database" @(
  "docker", "scripts"
)

Commit-Stage "ci: add GitHub Actions for lint, test and build" @(
  ".github"
)

Commit-Stage "docs: add README, architecture and contribution guides" @(
  "README.md", "docs", "CONTRIBUTING.md", "LICENSE"
)

Write-Host "Done. $(git log --oneline | Measure-Object -Line | Select-Object -ExpandProperty Lines) commits on main."