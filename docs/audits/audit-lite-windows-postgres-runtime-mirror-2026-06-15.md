# Audit Lite: Windows PostgreSQL Runtime Mirror

Date: 2026-06-15
Branch: `work/windows-local-1-design-contract`
Scope: Fix-forward for PR #192 `build Windows Local MSI` failure when EDB/CloudFront blocked PostgreSQL 17 Windows binary downloads.

## Findings

No unresolved findings.

## Evidence Reviewed

- CI failure was in `build Windows Local MSI`, step `Prepare portable Windows runtime payload`, after both the direct EDB PostgreSQL binary URL and the EDB download-page fallback returned CloudFront 403 responses.
- Published a public prerelease runtime mirror at `https://github.com/CivicSuite/civicsuite/releases/tag/windows-runtime-postgres-17.10-2`; asset `postgresql-17.10-2-windows-x64-binaries.zip` is 333,927,270 bytes and has SHA-256 `ef9b1e5e23d2e8a83914ba13d9dc536a72210fba53fd1808ff1f7e06bb22b106`.
- `desktop/runtime/windows-runtime-sources.json:11` now points the Windows Local payload builder at the CivicSuite-hosted PostgreSQL mirror, `desktop/runtime/windows-runtime-sources.json:12` pins the expected SHA-256, and `desktop/runtime/windows-runtime-sources.json:13` preserves the original EDB source URL as provenance.
- `desktop/scripts/prepare-runtime-payload.ps1:51` validates downloaded payload hashes, `desktop/scripts/prepare-runtime-payload.ps1:132` rejects stale cached files with the wrong hash, and `desktop/scripts/prepare-runtime-payload.ps1:356` applies the pinned PostgreSQL checksum to the primary download path.
- `desktop/tests/static-smoke.mjs:378`, `desktop/tests/static-smoke.mjs:385`, and `desktop/tests/static-smoke.mjs:392` lock the mirror URL, checksum, and original-source provenance into static verification.

## Verification

- GitHub release asset HEAD request returned HTTP 200 with content length 333,927,270.
- PowerShell script parse check: passed.
- `npm --prefix desktop test`: passed.
- `npm --prefix desktop run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts/verify-deployment-profile.py --static-only`: passed.
- `python scripts/policy/check_stage_evidence.py`: passed.
- `git diff --check`: passed with CRLF normalization warnings only.

## Residual Risk

This removes the MSI build's dependence on EDB/CloudFront availability for the pinned PostgreSQL archive. The remaining external dependency is GitHub release asset availability for the mirror; the pinned SHA-256 prevents silently accepting a corrupt or replaced payload.
