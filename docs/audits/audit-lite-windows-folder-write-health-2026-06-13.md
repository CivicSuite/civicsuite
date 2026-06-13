# Audit Lite: Windows Local Folder Write Health

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/supervisor.rs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/supervisor.rs:1316` distinguishes missing folders from existing folders.
- `desktop/src-tauri/src/supervisor.rs:1329` reports `Needs access` when a selected folder exists but cannot accept local saves.
- `desktop/src-tauri/src/supervisor.rs:1365` performs a bounded write probe by creating, writing, and removing a temporary health-check file.
- `desktop/src-tauri/src/supervisor.rs:1405` gives plain-English next steps for city data folder permission failures.
- `desktop/src-tauri/src/supervisor.rs:1412` gives the matching backup-folder guidance.
- `desktop/src-tauri/src/supervisor.rs:2245` verifies selected custom folders become writable after runtime folder preparation and no health-check temp files remain.
- `desktop/tests/static-smoke.mjs:317` guards the permission health copy and admin-detail contract.

## Verification

- `cargo fmt --check`
- `cargo test supervisor::tests::runtime_health_reports_selected_local_folders -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

The probe confirms create/write/delete access for normal local folders. It does not attempt ACL repair; if a municipal IT policy blocks the selected path, System Health now reports that condition and directs the user to choose a different folder or ask IT for write access.
