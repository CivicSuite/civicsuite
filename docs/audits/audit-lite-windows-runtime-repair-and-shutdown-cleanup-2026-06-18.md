# Audit Lite: Windows Runtime Repair and Shutdown Cleanup

Date: 2026-06-18
Scope: PR #192 Windows Local runtime lifecycle failures from `TESTER-RESULT-095.md`.

## Verdict

Pass with local evidence. `TESTER-RESULT-095.md` proved the fresh Clerk, Records, Code, backup, support bundle, model readiness, and installed-app identity paths, but the local PostgreSQL data store could not recover through product Start/Check/Repair, MSI uninstall returned 1603 after normal app close, and restore failed moving the live Data folder with Windows access denied. This patch makes repair recover partial PostgreSQL initialization, expands service Start/Repair to include required dependencies, and stops managed runtime services during normal desktop window close.

## Changes Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs)
  - Allows Repair/bootstrap to move aside an incomplete `Data/postgres` folder when `PG_VERSION` is absent, then reinitialize the local data store from the bundled payload.
  - Runs Postgres helper tools from their bundled `bin` directory and keeps command waits bounded.
  - Expands Start/Repair targets so City workflow services and task queue recovery include the PostgreSQL dependency instead of requiring operator-specific service ordering.
  - Makes Repair copy/verify payloads and then start the selected service set, returning a product result that reflects actual recovery work.
- [desktop/src-tauri/src/main.rs](../../desktop/src-tauri/src/main.rs)
  - Stops managed local runtime services on normal desktop window close so Windows Installer uninstall is less likely to encounter live child processes or locked runtime/profile files.

## Validation

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test supervisor::tests --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `CIVICSUITE_RUN_REAL_RUNTIME_COPY_TEST=1 CIVICSUITE_RUNTIME_PAYLOAD_DIR=C:\dev\Codex\civicsuite\desktop\src-tauri\target\release\_up_\runtime\payload cargo test real_copied_payload_repair_recovers_partial_postgres_when_enabled --manifest-path desktop/src-tauri/Cargo.toml -- --nocapture --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` (CRLF normalization warnings only)

## Follow-Up

Publish a new Windows Local MSI from this head and ask the tester to rerun the installed desktop app lifecycle with special attention to product Start/Repair recovering the local data store before restore, normal app close before MSI uninstall, Restore Latest Backup moving or bounding the live Data replacement, and the already-green fresh Clerk/Records/Code workflow evidence.
