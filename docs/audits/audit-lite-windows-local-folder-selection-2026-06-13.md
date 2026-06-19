# Audit Lite: Windows Local Folder Selection

Date: 2026-06-13
Scope: First-run and Settings local folder selection, persisted Windows profile locations, and runtime use of selected data/backup roots.

## Findings

None.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Evidence Reviewed

- `desktop/src-tauri/src/local_paths.rs` centralizes default, saved, and effective local profile paths.
- `desktop/src-tauri/src/first_run.rs` persists `installRoot`, `dataRoot`, and `backupRoot` from first-run actions, creates selected local folders, and returns saved locations in first-run state.
- `desktop/src-tauri/src/model.rs`, `desktop/src-tauri/src/workflows.rs`, and `desktop/src-tauri/src/supervisor.rs` now use the shared data/backup paths, so model files, workflow state, exports, backup, restore, and uninstall follow the saved location settings.
- `desktop/src/main.js` exposes a Local Folders editor in Settings and location/backup fields in first-run setup. The app install folder is shown as installer-owned/read-only; city data and backups are the editable runtime folders.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs` guard the Local Folders UI and copy.
- `desktop/src-tauri/src/first_run.rs` adds regression coverage proving a custom data folder and backup folder are persisted and become the effective runtime roots.

## Verification

- `cargo fmt --check`: passed.
- `cargo test -- --test-threads=1`: passed, 87 tests.
- `npm test`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only the repo's normal CRLF warnings for touched files.

## Residual Risk

This slice does not prove clean-machine MSI folder selection or reboot persistence. Those remain part of the clean-machine MSI walkthrough gate once the current Windows artifact is available.
