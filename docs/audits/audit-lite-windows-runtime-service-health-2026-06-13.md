# Audit Lite: Windows Runtime Service Health

Date: 2026-06-13
Scope: Windows local runtime service health hardening for the bundled Python workflow service and task queue.

## Findings

None.

## Evidence Reviewed

- `desktop/runtime/python-services/civicsuite_runtime/migrate.py:33` now runs each Alembic pass with the intended URL in both Alembic config and `DATABASE_URL`, allowing CivicCore's migration environment to run with the sync Postgres driver while preserving the previous environment after each pass.
- `desktop/runtime/python-services/civicsuite_runtime/migrate.py:56` now applies CivicCore migrations before Records, Clerk, and Code, so the local task queue table exists before services report ready.
- `desktop/runtime/python-services/civicsuite_runtime/services.py:107` now checks the configured local database and `public.civiccore_local_tasks`, so `/health` cannot report ready when the workflow schema is missing.
- `desktop/runtime/windows-runtime-payloads.json:31` and `desktop/tests/static-smoke.mjs:165` now require the CivicCore migration config and local task queue migration in the embedded Windows payload.
- `desktop/src-tauri/src/supervisor.rs:1362` waits briefly for required services to become healthy before final bootstrap health evaluation.
- `desktop/src-tauri/src/supervisor.rs:1751` expands the opt-in real runtime proof to start portable Postgres, Python services, and the task queue from the prepared Windows payload.

## Verification

- `npm run prepare-runtime-payload`: passed.
- Opt-in real runtime proof with prepared payload: passed, including Postgres, migrations, Python service health, and task queue health.
- `npm test`: passed.
- `cargo test`: passed, 54 tests.
- `cargo fmt --check`: passed.
- `git diff --check`: passed with only the repo's normal CRLF warnings for touched files.
- Process/temp cleanup check: no leftover `postgres`, `python`, or `cargo` proof processes and no `civicsuite-desktop-supervisor-real-test-*` temp profile remained.

## Residual Risk

- The opt-in real runtime proof emits Rust's "running for over 60 seconds" notice on this machine. That is acceptable for the clean local runtime proof because it performs real payload install, database initialization, migrations, and service startup, but it should remain opt-in rather than part of every fast local edit loop.
