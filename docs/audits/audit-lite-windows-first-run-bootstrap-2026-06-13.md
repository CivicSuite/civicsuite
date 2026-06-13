# Audit Lite: Windows First-Run Runtime Bootstrap

Date: 2026-06-13
Scope: first-run health verification now actively prepares, starts, and verifies required local services, while preserving the verified-model gate before setup can finish.

## Findings

No findings.

Severity counts: Blocker 0 / Critical 0 / Major 0 / Minor 0 / Nit 0.

## Evidence Reviewed

- `desktop/src-tauri/src/supervisor.rs:1362` adds `bootstrap_required_runtime`, which installs/repairs required payloads, starts services, and then runs health verification before returning a first-run result.
- `desktop/src-tauri/src/supervisor.rs:1246` makes start idempotent for already-healthy services so repeated first-run checks do not spawn duplicate local service processes.
- `desktop/src-tauri/src/first_run.rs:565` wires the health step to the bootstrap helper instead of passively checking pre-existing health state.
- `desktop/src-tauri/src/first_run.rs:552` keeps the pinned model checksum gate in front of final health verification.
- `desktop/src-tauri/src/model.rs:523` adds a test-only override so model and runtime first-run guards can be tested independently without a multi-GB model fixture.
- `desktop/src/main.js:551` updates the visible setup action to "Set Up and Check Services," matching the active behavior.

## Verification

- `cargo test` passed: 54 tests.
- Opt-in real-runtime proof passed with `CIVICSUITE_RUN_REAL_RUNTIME_TEST=1` against `desktop/runtime/payload`; portable Postgres initialized, started, installed pgvector, ran migrations, passed health, and stopped.
- `npm test` passed.
- `cargo fmt --check` passed.
- `git diff --check` passed with line-ending warnings only.
- Post-run process/temp checks found no leftover Postgres, Python, Cargo, or `civicsuite-desktop-supervisor-real-test-*` state.

## Residual Risk

This slice proves backend first-run orchestration and the desktop button label. A full clean-machine walkthrough still needs to prove the complete installer, model download, all services, reboot survival, repair, uninstall, and reinstall path at the stage gate.
