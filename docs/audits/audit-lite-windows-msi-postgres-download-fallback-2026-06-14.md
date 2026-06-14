# Audit Lite: Windows MSI PostgreSQL Download Fallback

Date: 2026-06-14
Branch: `work/windows-local-1-design-contract`
Scope: Fix-forward for PR #192 `build Windows Local MSI` failure at `prepare-runtime-payload.ps1`.

## Findings

No unresolved findings.

## Evidence Reviewed

- CI failure was in `build Windows Local MSI`, step `Prepare portable Windows runtime payload`, where the direct PostgreSQL binary download returned a CloudFront 403 before Tauri build.
- `Invoke-CivicDownload` now downloads to a temporary file, retries briefly, moves into cache only after success, and removes failed partial files: `desktop/scripts/prepare-runtime-payload.ps1:111`, `desktop/scripts/prepare-runtime-payload.ps1:124`.
- `Install-PostgresPayload` now falls back from the pinned direct URL to existing PostgreSQL download-page discovery when the direct CDN URL fails: `desktop/scripts/prepare-runtime-payload.ps1:312`, `desktop/scripts/prepare-runtime-payload.ps1:330`.
- Static smoke now asserts the fallback contract text remains present: `desktop/tests/static-smoke.mjs:300`.

## Verification

- PowerShell script parse check: passed.
- `npm test -- --runInBand`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `git diff --check` returned only existing CRLF normalization warnings.

## Residual Risk

This fixes direct CDN fragility and avoids poisoned cache files, but it still depends on EDB offering either the pinned direct file or a discoverable Windows binary link from the download page. A future source outage would still require a mirrored artifact or internal package cache.
