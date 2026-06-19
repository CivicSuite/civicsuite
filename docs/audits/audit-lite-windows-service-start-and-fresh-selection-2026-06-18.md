# Audit Lite: Windows Service Start And Fresh Selection

Date: 2026-06-18
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-094.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-094.md proved elevated install, uninstall, reinstall, Backup Now, support bundle creation, Records durability, model-cache skip/preserve evidence, artifact integrity, and parts of Code/Clerk durability. The remaining product failures were:

- product Start/Repair left local data store, city workflow services, task queue schema, and background queue health degraded before restore;
- fresh Clerk and Code actions applied to stale restored records instead of the fresh DIR094 records;
- Restore Latest Backup still stayed in desktop `Working`.

Local reproduction with the packaged Windows runtime payload found the service-start hang before the tester rerun: the Windows process lookup path passed an executable path as a PowerShell command argument, which could launch embedded `python.exe` with no arguments and wait forever while trying to discover service PIDs.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): command-output waits now capture stdout/stderr through temp files instead of inherited pipes, avoiding hangs when child commands spawn long-lived grandchildren.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): Postgres start now uses a bounded status wait with null stdio and then verifies database/migration readiness.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): Windows executable PID lookup passes the target path through an environment variable and a bounded command wait, so embedded runtime executables are never interpreted as PowerShell commands to launch.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): service startup records the settled long-lived child PID when launcher processes hand off to Python or other runtime processes.
- [desktop/runtime/python-services/civicsuite_runtime/migrate.py](../../desktop/runtime/python-services/civicsuite_runtime/migrate.py): migration CLI exits the process explicitly after `main()` returns so imported service-package background threads cannot hold migration commands open.
- [desktop/src/main.js](../../desktop/src/main.js): workflow action selection now compares pre-action and post-action city-work state and selects the newly added meeting/source/request/etc. instead of relying only on freshness ordering.
- [desktop/tests/browser/workflow-pages.spec.mjs](../../desktop/tests/browser/workflow-pages.spec.mjs): added a desktop-bridge regression where restored stale records have newer-looking IDs, then verified fresh Clerk and Code action payloads target the newly added records.
- [desktop/tests/static-smoke.mjs](../../desktop/tests/static-smoke.mjs): updated the resilience smoke pin for the new pre/post selection call.

## Evidence

- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop/scripts/prepare-runtime-payload.ps1 -PayloadRoot C:\dev\Codex\civicsuite\desktop\src-tauri\target\release\_up_\runtime\payload -SkipDownloads -SkipPgvectorBuild`
- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop/scripts/prepare-runtime-payload.ps1 -SkipDownloads -SkipPgvectorBuild`
- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test command_output_times_out_instead_of_hanging --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test postgres_start_verifies_database_even_when_tcp_port_is_open --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `CIVICSUITE_RUN_REAL_RUNTIME_TEST=1 CIVICSUITE_RUNTIME_PAYLOAD_DIR=C:\dev\Codex\civicsuite\desktop\src-tauri\target\release\_up_\runtime\payload cargo test real_postgres_payload_initializes_and_migrates_when_enabled --manifest-path desktop/src-tauri/Cargo.toml -- --nocapture --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. The next directive should require installed desktop app confirmation that product Start/Repair brings up local data store, city workflow services, task queue schema, and background queue health; fresh Clerk and Code actions target the newly created DIR marker records; Restore Latest Backup returns a bounded result instead of remaining stuck on `Working`; and Backup Now, support bundle, Records durability, Code durability, Clerk adopted-legislation workflow, model-cache skip/preserve evidence, uninstall/reinstall, and repair remain green.
