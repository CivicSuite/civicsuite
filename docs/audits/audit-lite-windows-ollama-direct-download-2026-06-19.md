# Audit Lite: Windows Ollama Direct Download

Date: 2026-06-19

Scope:
- `desktop/runtime/windows-runtime-sources.json`
- `desktop/scripts/prepare-runtime-payload.ps1`

Intent:
- Fix the Windows MSI CI failure where `prepare-runtime-payload.ps1` depended on the live Ollama GitHub releases API and failed after repeated `504 Gateway Timeout` responses.
- Keep the runtime input deterministic by pinning the downloaded Ollama asset version and SHA-256 instead of following the moving `latest` release redirect.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low
- 0 Watchlist

Evidence:
- `desktop/runtime/windows-runtime-sources.json:39` now pins the Ollama Windows runtime to `v0.30.10`.
- `desktop/runtime/windows-runtime-sources.json:40` now provides a versioned Ollama Windows asset URL.
- `desktop/runtime/windows-runtime-sources.json:41` now records the expected asset SHA-256.
- `desktop/scripts/prepare-runtime-payload.ps1:154` gives `Invoke-WebRequest` an explicit 30-minute timeout for large runtime assets.
- `desktop/scripts/prepare-runtime-payload.ps1:632` prefers `download_url` before calling the release API fallback.
- `desktop/scripts/prepare-runtime-payload.ps1:639` passes the pinned SHA-256 into the existing retrying `Invoke-CivicDownload` path.
- `desktop/scripts/prepare-runtime-payload.ps1:646` preserves the existing `ollama.exe` normalization after extraction.

Verification:
- PowerShell parser check for `desktop/scripts/prepare-runtime-payload.ps1`: passed.
- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop\scripts\prepare-runtime-payload.ps1 -RepoRoot C:\dev\Codex\civicsuite -SkipDownloads -SkipPgvectorBuild`: passed and verified embedded Python service imports including CivicNotice.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\policy\check_stage_evidence.py`: passed.
- `git diff --check`: passed with line-ending warnings only.

Residual Risk:
- The direct URL still resolves through GitHub release download infrastructure, but it removes the separate live API lookup that produced the observed 504 failure and verifies the downloaded bytes against the pinned checksum. The full Windows MSI GitHub Actions gate remains the release proof.
