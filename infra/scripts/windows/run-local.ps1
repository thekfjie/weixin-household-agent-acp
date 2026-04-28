Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..\..")

Set-Location $repoRoot

$env:COREPACK_HOME = Join-Path $repoRoot ".corepack"
$env:PNPM_HOME = Join-Path $repoRoot ".pnpm-home"

$dataDir = Join-Path $repoRoot "data"
$runtimeDir = Join-Path $repoRoot "runtime"
$adminWorkspace = Join-Path $runtimeDir "codex-admin"
$familyWorkspace = Join-Path $runtimeDir "codex-family"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
New-Item -ItemType Directory -Force -Path $adminWorkspace | Out-Null
New-Item -ItemType Directory -Force -Path $familyWorkspace | Out-Null

if (-not $env:DATA_DIR) {
  $env:DATA_DIR = $dataDir
}

if (-not $env:CODEX_ADMIN_WORKSPACE) {
  $env:CODEX_ADMIN_WORKSPACE = $adminWorkspace
}

if (-not $env:CODEX_FAMILY_WORKSPACE) {
  $env:CODEX_FAMILY_WORKSPACE = $familyWorkspace
}

if (-not $env:TIMEZONE) {
  $env:TIMEZONE = "Asia/Shanghai"
}

if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
  Write-Host "[run-local] installing dependencies..."
  corepack pnpm install
}

Write-Host "[run-local] building project..."
corepack pnpm build

Write-Host "[run-local] starting service..."
node .\dist\apps\server\index.js
