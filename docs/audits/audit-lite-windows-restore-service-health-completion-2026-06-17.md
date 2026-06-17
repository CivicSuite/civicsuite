# Audit Lite: Windows Restore Service Health Completion

Date: 2026-06-17
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-089.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-089.md proved elevated install, uninstall, reinstall, backup manifest/README creation, adopted-legislation persistence, Records/Code durability, support bundle creation, repair, and post-restore data visibility. The remaining product failure was that Restore Latest Backup stayed in the desktop `Working` state and workflow service/task queue health remained degraded after product Stop, retry, Start, Check, and Repair controls.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): bounds native command-output waits used by local database setup and city-core migrations, so a stuck post-restore helper returns an explicit product result instead of leaving the desktop review panel in progress.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): makes Start/post-restore startup run PostgreSQL database and migration verification even when the local data store TCP port is already open, preventing a restored profile with a missing task queue schema from remaining permanently degraded.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): adds regression coverage for command-output timeout behavior and for Postgres start verifying database setup despite an already-open TCP health port.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test command_output_times_out_instead_of_hanging --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test postgres_start_verifies_database_even_when_tcp_port_is_open --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-090 should require installed desktop app confirmation that Restore Latest Backup returns a completed product result after uninstall/reinstall, workflow services and task queue health recover through product controls without hand-killing processes or editing the profile, and backup manifest/README, adopted legislation persistence, Records/Code durability, support bundle, and repair remain green.
