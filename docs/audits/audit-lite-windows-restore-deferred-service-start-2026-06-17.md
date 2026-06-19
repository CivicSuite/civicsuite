# Audit Lite: Windows Restore Deferred Service Start

Date: 2026-06-17
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-090.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-090.md proved elevated install, uninstall, reinstall, backup manifest/README creation, adopted-legislation persistence, Records/Code durability, support bundle creation, repair, and post-restore data visibility. The remaining product failure was that Restore Latest Backup still stayed in the desktop `Working` state and workflow service/task queue health remained degraded after product Stop, retry, Start, Check, and Repair controls.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): after verified backup restore and Data/config swap, restore now clears restored runtime PIDs and returns `Restore needs service start` when bundled runtime binaries are present instead of attempting service startup and health recovery inside the restore action.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): preserves the existing `Restore complete` result for profiles where runtime binaries are not yet installed, with guidance to repair/install runtime files before starting services.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): adds regression coverage proving restore completes the profile swap and returns a bounded service-start result without executing service startup while the restore action is still open.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test postgres_start_verifies_database_even_when_tcp_port_is_open --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test command_output_times_out_instead_of_hanging --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-091 should require installed desktop app confirmation that Restore Latest Backup returns `Restore needs service start` or `Restore complete` instead of remaining stuck on Working, then verify Start/Check/Repair controls recover local data store, city workflow services, task queue schema, and background work queue health without hand-killing processes or editing the profile.
