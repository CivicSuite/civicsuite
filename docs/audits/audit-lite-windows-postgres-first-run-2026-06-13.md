# Audit Lite: Windows Local Postgres First-Run

Date: 2026-06-13
Scope: portable PostgreSQL first-run initialization, local DB/user secret, pgvector setup, city-core migration runner, runtime payload assembly, and opt-in real-runtime proof.

## Findings

No findings.

Severity counts: Blocker 0 / Critical 0 / Major 0 / Minor 0 / Nit 0.

## Evidence Reviewed

- `desktop/src-tauri/src/supervisor.rs:657` initializes the local data store under the CivicSuite profile, generates the local password secret, runs `initdb`, and writes the local-only port/listen config.
- `desktop/src-tauri/src/supervisor.rs:739` creates/verifies the `civicsuite` database and installs `CREATE EXTENSION IF NOT EXISTS vector`.
- `desktop/src-tauri/src/supervisor.rs:796` invokes the embedded Python migration runner with the same local runtime environment used by service startup.
- `desktop/src-tauri/src/supervisor.rs:826` starts Postgres through `pg_ctl` without capturing long-lived server pipes, waits for localhost readiness, then applies database setup and migrations.
- `desktop/src-tauri/src/supervisor.rs:1272` stops the local data store with `pg_ctl stop`.
- `desktop/runtime/python-services/civicsuite_runtime/migrate.py:44` runs CivicRecords AI, CivicClerk, and CivicCode Alembic migrations against the local database.
- `desktop/scripts/prepare-runtime-payload.ps1:368` copies CivicRecords migration assets into the embedded runtime payload, and `desktop/runtime/windows-runtime-payloads.json:35` makes those files required payload artifacts.
- `desktop/src-tauri/src/supervisor.rs:1666` adds an opt-in real-runtime test that starts the portable Postgres payload, verifies migration readiness, confirms health, and stops the service.

## Verification

- `npm run prepare-runtime-payload` passed.
- `npm test` passed.
- `cargo test` passed: 53 tests.
- Opt-in real-runtime proof passed with `CIVICSUITE_RUN_REAL_RUNTIME_TEST=1` against `desktop/runtime/payload`; portable Postgres initialized, started, installed pgvector, ran city-core migrations, passed health, and stopped.
- `cargo fmt --check` passed.
- `git diff --check` passed with line-ending warnings only.
- Post-run process/temp checks found no leftover Postgres, Python, Cargo, or `civicsuite-desktop-supervisor-real-test-*` state.

## Residual Risk

The proof is local-runtime focused, not a full clean-machine installer walkthrough. Fresh install, reboot survival, repair, uninstall, and reinstall remain covered by the later stage gate using `audit-full` and `walkthrough`.
