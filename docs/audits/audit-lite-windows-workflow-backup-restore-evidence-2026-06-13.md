# Audit Lite: Windows Workflow Backup Restore Evidence

Date: 2026-06-13

Scope:
- `desktop/src-tauri/src/supervisor.rs`

## Findings

No unresolved findings.

## Evidence Reviewed

- `desktop/src-tauri/src/supervisor.rs:1824` extends the backup test to include the actual local workflow state path.
- `desktop/src-tauri/src/supervisor.rs:1831` writes `Data/workflows/city-work.json` before backup.
- `desktop/src-tauri/src/supervisor.rs:1841` writes an exported meeting packet under `Data/exports/meetings`.
- `desktop/src-tauri/src/supervisor.rs:1864` and `desktop/src-tauri/src/supervisor.rs:1870` assert the backup contains workflow state and exports, not only generic files.
- `desktop/src-tauri/src/supervisor.rs:1878` extends restore coverage for workflow state.
- `desktop/src-tauri/src/supervisor.rs:1885` through `desktop/src-tauri/src/supervisor.rs:1896` seed records workflow state and a released export before backup.
- `desktop/src-tauri/src/supervisor.rs:1906` through `desktop/src-tauri/src/supervisor.rs:1914` mutate/remove those paths after backup.
- `desktop/src-tauri/src/supervisor.rs:1932` through `desktop/src-tauri/src/supervisor.rs:1940` assert restore brings back the workflow state and export file.

## Verification

- `cargo test backup_copies_local_data_and_config -- --nocapture`: passed.
- `cargo test restore_replaces_profile_from_latest_backup -- --nocapture`: passed.
- `cargo test uninstall_removes_profile_after_final_backup -- --nocapture`: passed.
- `cargo test`: passed, 66 tests.
- `npm test`: passed.
- `cargo fmt --check`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts/policy/check_stage_evidence.py`: passed.
- `git diff --check`: passed.

## Residual Risk

This is local regression evidence for the desktop lifecycle code path. Full clean-machine install, backup, restore, uninstall, reinstall, and reboot survival still belong to the clean-machine release gate once the Windows MSI artifact is available.
