# Audit Lite - Windows First-Run Recovery Actions - 2026-06-13

## Scope

Reviewed the first-run recovery-action fix and the mechanical CI fix for
Windows runtime payload hashing.

Changed files:

- `desktop/src-tauri/src/first_run.rs`
- `desktop/scripts/prepare-runtime-payload.ps1`
- `desktop/tests/static-smoke.mjs`

Intended behavior:

- First-run `repair`, `backup`, and `uninstall` actions use the real supervisor
  lifecycle executor instead of falling through setup-step progress.
- Recovery actions do not mark first-run setup steps complete.
- Backup creates a real backup under the configured profile backup root.
- Uninstall creates a final backup and removes local profile data/config.
- Runtime payload hashing no longer depends on the `Get-FileHash` cmdlet,
  which was missing in the GitHub Windows MSI runner.

## Findings

None.

Severity counts: Blocker 0 / Critical 0 / Major 0 / Minor 0 / Nit 0.

## Verification

- `cargo test first_run_ -- --nocapture` in `desktop/src-tauri/`: passed, 12
  targeted first-run tests.
- `cargo test` in `desktop/src-tauri/`: passed, 60 tests.
- `cargo fmt --check` in `desktop/src-tauri/`: passed.
- `npm test` in `desktop/`: passed; static smoke now guards the SHA-256
  implementation and rejects `Get-FileHash`.
- PowerShell script parse check for `desktop/scripts/prepare-runtime-payload.ps1`:
  passed.
- `git diff --check`: passed.

## Residual Risk

- GitHub Actions must rerun `desktop-windows-msi` after push to confirm the
  hosted Windows runner proceeds beyond runtime payload hashing and uploads the
  MSI artifact.
- The installer-cleanroom Linux lifecycle matrix was still running while this
  audit was written; its completed failure logs were not available until the
  full matrix finished.
