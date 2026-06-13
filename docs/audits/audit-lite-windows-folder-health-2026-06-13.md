# Audit Lite: Windows Local Folder Health

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/supervisor.rs`, `desktop/src/main.js`, `desktop/tests/browser/model-readiness.spec.mjs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/supervisor.rs:1309` adds explicit health rows for selected local folders.
- `desktop/src-tauri/src/supervisor.rs:1356` reports `City data folder` and `Backup folder` before runtime service health.
- `desktop/src-tauri/src/supervisor.rs:1397` ensures install/repair creates the backup folder alongside data, logs, and files.
- `desktop/src/main.js:420` keeps browser-preview fallback aligned with the desktop folder health rows.
- `desktop/src/main.js:2692` hides runtime service action buttons for non-actionable health rows while preserving actions for real services.
- `desktop/tests/browser/model-readiness.spec.mjs:47` verifies the folder health rows are visible and do not expose service action controls.

## Verification

- `cargo fmt --check`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice verifies folder existence, not deep write-permission probing. Permission repair belongs with the next Windows runtime/repair slice because probing write access may need careful non-destructive filesystem behavior on locked-down municipal machines.
