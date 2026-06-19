# Audit Lite: Windows Task Queue Health

Date: 2026-06-14
Scope: System Health visibility for the PostgreSQL-backed CivicCore task queue schema.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/supervisor.rs` now reads the bundled City workflow services `/health` payload when available and exposes a separate `Task queue schema` health item.
- The status distinguishes ready schema, missing migrations, missing database configuration, unavailable data store, and workflow services not running.
- The queue-schema health item is non-actionable and points operators to the correct existing actions: start/repair Local data store or City workflow services.
- `desktop/src/main.js` fallback health now mirrors the Windows runtime contract for City workflow services, task queue schema, background work queue, local AI model, and local document storage.
- `desktop/tests/browser/model-readiness.spec.mjs` proves the System Health surface shows the task queue schema card in browser walkthrough coverage.
- `docs/installer/operator-walkthrough.md` now includes the queue schema status in first-run install verification.

## Verification Evidence

- `cargo fmt`: passed.
- `cargo test task_queue_schema_health_reports_runtime_database_detail -- --test-threads=1 --nocapture`: passed.
- `cargo test -- --test-threads=1`: passed, 108 tests.
- `npm test`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice proves local health reporting for the Windows task queue schema and browser-visible UX. It does not replace the later clean-machine proof that the installed PostgreSQL service applies the queue migration, starts the background worker, survives reboot, and reports ready through the installed MSI path.
