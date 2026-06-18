# Audit Lite: Windows Supervisor Command Responsiveness

Date: 2026-06-18
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-092.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-092.md proved the installed Tauri desktop app surface was used and that elevated Windows Installer lifecycle operations worked. The remaining product failure moved from a restore-only symptom to a shared desktop lifecycle symptom:

- Backup Now entered `Working` and never cleared during the observed run; no fresh backup manifest appeared.
- Create Support Bundle entered `Working` and never cleared during the observed run; no fresh support manifest appeared.
- Restore Latest Backup left the desktop app not responding.
- Fresh Clerk, Records, and Code workflow evidence appeared in the live session but was not durable after close/reopen.

The common product boundary was the synchronous Tauri command path for local filesystem/process work and app-state reloads.

## Fix Reviewed

- [desktop/src-tauri/src/main.rs](../../desktop/src-tauri/src/main.rs): `get_app_state`, `first_run_action`, `supervisor_action`, and `city_work_action` now run their blocking filesystem/process work through `tauri::async_runtime::spawn_blocking` with panic-safe error messages. This keeps native backup, support bundle, restore, first-run, and workflow persistence work off the UI command thread.
- [desktop/src/main.js](../../desktop/src/main.js): Supervisor action results now render immediately after the native action resolves, before the slower app-state/health refresh. A degraded or slow health reload no longer leaves the visible result stuck on `Working`.
- [desktop/tests/browser/model-readiness.spec.mjs](../../desktop/tests/browser/model-readiness.spec.mjs): restore, backup, and support bundle regressions now mock a never-resolving `get_app_state` refresh and prove completed Supervisor results still replace `Working`.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml`
- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs --grep "desktop restore result|desktop backup and support"`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and installed-app tester rerun. The next directive should require Backup Now, Create Support Bundle, and Restore Latest Backup to leave `Working` with a completed or bounded result even when service health remains degraded, then verify backup/support manifests, durable Clerk/Records/Code state, and restore-after-reinstall service recovery.
