# Audit Lite - Windows Backup Hash Restore - 2026-06-13

Scope: Windows Local 1.0 runtime backup/restore hardening in `desktop/src-tauri/src/supervisor.rs`.

## Findings

No unresolved findings.

## Evidence

- Backup manifests now record per-file relative paths, byte counts, and SHA-256 hashes. Evidence: `desktop/src-tauri/src/supervisor.rs:127`, `desktop/src-tauri/src/supervisor.rs:134`, `desktop/src-tauri/src/supervisor.rs:434`, `desktop/src-tauri/src/supervisor.rs:581`.
- Restore verifies the selected backup manifest before stopping services or replacing the local profile, and returns a structured clerk-readable failure when files do not match. Evidence: `desktop/src-tauri/src/supervisor.rs:606`, `desktop/src-tauri/src/supervisor.rs:1612`, `desktop/src-tauri/src/supervisor.rs:1619`.
- Restore refuses backups that contain no local data or setup/config files, preventing accidental deletion from an empty pre-setup backup. Evidence: `desktop/src-tauri/src/supervisor.rs:1634`.
- Regression coverage checks manifest hash entries, normal restore, tamper refusal, empty-backup refusal, and final-uninstall backup behavior. Evidence: `desktop/src-tauri/src/supervisor.rs:1985`, `desktop/src-tauri/src/supervisor.rs:2131`, `desktop/src-tauri/src/supervisor.rs:2172`.

## Verification

- `cargo test supervisor::tests::` passed: 15 passed.
- `cargo test` passed: 75 passed.

## Residual Risk

Clean-machine restore through the packaged MSI still needs end-stage walkthrough evidence once the current MSI artifact is available.
