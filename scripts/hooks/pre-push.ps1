#!/usr/bin/env pwsh
# SPDX-License-Identifier: Apache-2.0
<#
Blocks pushes when the CivicSuite stage branch is in an unsafe state.

This hook is intentionally small and deterministic. It does not replace the
required audit-lite/audit-full process; it catches the recoverability failures
that caused the May 2026 lost-work incident.
#>

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $repoRoot

$branch = (git branch --show-current).Trim()
if (-not $branch) {
    Write-Error "pre-push gate: unable to determine current branch."
    exit 1
}

if ($branch -eq "main" -or $branch -eq "master") {
    Write-Error "pre-push gate: direct pushes from $branch are blocked; use a stage branch and PR/merge."
    exit 1
}

$dirty = git status --porcelain
if ($dirty) {
    Write-Error "pre-push gate: working tree has uncommitted changes. Commit or remove them before pushing."
    $dirty | ForEach-Object { Write-Error "  $_" }
    exit 1
}

$head = (git rev-parse HEAD).Trim()
if ($head -notmatch "^[0-9a-f]{40}$") {
    Write-Error "pre-push gate: HEAD did not resolve to a full 40-character SHA."
    exit 1
}

$baseline = Join-Path $repoRoot "docs\process\city-core-recovery-baseline-2026-05-30.md"
if ($branch -like "stage-0-*") {
    if (-not (Test-Path -LiteralPath $baseline)) {
        Write-Error "pre-push gate: Stage 0 branches must carry the recovery baseline document at $baseline."
        exit 1
    }
}

Write-Output "pre-push gate: passed for $branch at $head"

