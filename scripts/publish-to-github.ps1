# Publish LexAI to GitHub (cristianq2020/lexai).
# Prerequisites: GitHub CLI authenticated — run: gh auth login
# Usage: pwsh scripts/publish-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  $portable = Join-Path $env:TEMP "gh-cli\bin\gh.exe"
  if (Test-Path $portable) { $gh = $portable } else {
    throw "GitHub CLI not found. Install: winget install GitHub.cli"
  }
} else { $gh = $gh.Source }

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Not authenticated. Run: gh auth login --hostname github.com --git-protocol https --web"
}

$owner = "cristianq2020"
$repo = "lexai"
$remote = "https://github.com/$owner/$repo.git"

$exists = & $gh repo view "$owner/$repo" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Creating repository $owner/$repo ..."
  & $gh repo create $repo `
    --public `
    --description "LexAI v2 — Despacho digital de IA jurídica en español" `
    --source . `
    --remote origin `
    --push
} else {
  if (-not (git remote get-url origin 2>$null)) {
    git remote add origin $remote
  }
  git push -u origin main
}

Write-Host "Published: https://github.com/$owner/$repo"