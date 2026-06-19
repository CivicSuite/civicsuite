# Audit Lite: Windows Open Backup Folder

Date: 2026-06-13

Scope: System Health backup-folder lifecycle action for the Windows local desktop profile.

## Findings

None.

## Evidence Reviewed

- `desktop/runtime/windows-local-runtime.json:10` includes `open-backup-folder` in the Windows runtime lifecycle action contract.
- `desktop/src-tauri/src/supervisor.rs:14` includes `open-backup-folder` in the required lifecycle action list checked against the manifest.
- `desktop/src-tauri/src/supervisor.rs:1598` resolves the configured backup root and opens it through the shared local folder opener.
- `desktop/src-tauri/src/supervisor.rs:1721` dispatches the manifest-approved supervisor action to the new backup-folder handler.
- `desktop/src-tauri/src/supervisor.rs:2072` verifies the action creates the backup root and returns the expected status.
- `desktop/src/main.js:2426` exposes `Open Backup Folder` beside Backup, Restore, and Uninstall in System Health.
- `desktop/tests/static-smoke.mjs:215` verifies the runtime manifest keeps the lifecycle action declared.
- `desktop/tests/browser/model-readiness.spec.mjs:46` verifies the button remains visible in the System Health surface.
- `desktop/tests/browser/model-readiness.spec.mjs:58` verifies browser preview blocks the action with the desktop-app-required message.

## Verification

- `cargo fmt --check` in `desktop/src-tauri`: PASS.
- `cargo test open_backup_folder` in `desktop/src-tauri`: PASS.
- `cargo test manifest_actions_cover_required_lifecycle` in `desktop/src-tauri`: PASS.
- `cargo test` in `desktop/src-tauri`: PASS, 81 passed.
- `npm test` in `desktop`: PASS.
- `npm run test:browser -- model-readiness.spec.mjs` in `desktop`: PASS, 5 passed.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

Live Explorer launch remains intentionally suppressed in unit tests. The clean-machine walkthrough still needs to verify that `Open Backup Folder` opens the expected installed-app backup path on Windows.
