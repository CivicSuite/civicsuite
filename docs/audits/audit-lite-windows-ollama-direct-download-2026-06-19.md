# Audit Lite: Windows Ollama Direct Download

Date: 2026-06-19

Scope:
- `desktop/runtime/windows-runtime-sources.json`
- `desktop/scripts/prepare-runtime-payload.ps1`

Intent:
- Fix the Windows MSI CI failure where `prepare-runtime-payload.ps1` depended on the live Ollama GitHub releases API and failed after repeated `504 Gateway Timeout` responses.

Findings:
- 0 Critical
- 0 High
- 0 Medium
- 0 Low
- 0 Watchlist

Evidence:
- `desktop/runtime/windows-runtime-sources.json:39` now provides a direct Ollama Windows asset URL.
- `desktop/scripts/prepare-runtime-payload.ps1:632` prefers `download_url` before calling the release API fallback.
- `desktop/scripts/prepare-runtime-payload.ps1:639` downloads the direct asset through the existing retrying `Invoke-CivicDownload` path.
- `desktop/scripts/prepare-runtime-payload.ps1:646` preserves the existing `ollama.exe` normalization after extraction.

Verification:
- PowerShell parser check for `desktop/scripts/prepare-runtime-payload.ps1`: passed.
- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop\scripts\prepare-runtime-payload.ps1 -RepoRoot C:\dev\Codex\civicsuite -SkipDownloads -SkipPgvectorBuild`: passed and verified embedded Python service imports including CivicNotice.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\policy\check_stage_evidence.py`: passed.
- `git diff --check`: passed with line-ending warnings only.

Residual Risk:
- The direct URL still resolves through GitHub release download infrastructure, but it removes the separate live API lookup that produced the observed 504 failure. The full Windows MSI GitHub Actions gate remains the release proof.
