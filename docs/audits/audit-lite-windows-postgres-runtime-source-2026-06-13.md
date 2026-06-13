# Audit Lite: Windows Postgres Runtime Source Pin

Date: 2026-06-13

Scope: CI fix for the Windows Local MSI runtime payload preparation path after `desktop-windows-msi` failed while scraping the EDB PostgreSQL binaries page.

## Findings

None.

## Evidence Reviewed

- `desktop/runtime/windows-runtime-sources.json:10` pins the PostgreSQL source version to `17.10-2`.
- `desktop/runtime/windows-runtime-sources.json:11` now provides a direct PostgreSQL 17 Windows x86-64 binary ZIP URL, avoiding CI dependence on the EDB download-page scrape.
- `desktop/scripts/prepare-runtime-payload.ps1:224` routes PostgreSQL source resolution through `Get-PostgresSourceUrl`.
- `desktop/scripts/prepare-runtime-payload.ps1:226` prefers the manifest-pinned `download_url` and only falls back to page discovery if a direct URL is absent.
- `desktop/scripts/prepare-runtime-payload.ps1:63` sends an explicit CivicSuite user agent for runtime downloads.
- `desktop/tests/static-smoke.mjs:180` now guards the direct PostgreSQL binary ZIP URL.
- `desktop/tests/static-smoke.mjs:189` now guards the script-level source resolution helper.

## Verification

- `gh-fix-ci` inspection found the failed PR #192 check was `desktop-windows-msi`, failing in `Prepare portable Windows runtime payload` because `Invoke-WebRequest` against `https://www.enterprisedb.com/download-postgresql-binaries` received CloudFront 403.
- Direct target validation: `https://sbp.enterprisedb.com/getfile.jsp?fileid=1260307` resolves to `https://get.enterprisedb.com/postgresql/postgresql-17.10-2-windows-x64-binaries.zip`.
- `npm test` in `desktop`: PASS.
- PowerShell parser check for `desktop/scripts/prepare-runtime-payload.ps1`: PASS.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

The full Windows MSI build and 333MB PostgreSQL archive download were not re-run locally. GitHub Actions remains the authoritative verification for this mechanical CI fix.
