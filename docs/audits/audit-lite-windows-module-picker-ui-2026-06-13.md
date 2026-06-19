# Audit Lite: Windows Module Picker UI

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: Desktop module-selection UI and payload wiring.

## Findings

None after repair.

## Repair Made During Audit

- The first pass let the frontend infer whether a module was ready from partial summary fields. That could drift from the Rust installable-module validator as future modules change.
- Fixed by exposing authoritative `contract_ready` and `blocked_reason` fields from `module_registry::module_summaries()` and switching the picker to use that state.

## Evidence

- Backend contract state: `desktop/src-tauri/src/module_registry.rs:101`, `desktop/src-tauri/src/module_registry.rs:606`
- Backend regression coverage: `desktop/src-tauri/src/module_registry.rs:807`, `desktop/src-tauri/src/module_registry.rs:819`
- UI payload and picker: `desktop/src/main.js:596`, `desktop/src/main.js:746`, `desktop/src/main.js:2563`, `desktop/src/main.js:2671`
- Settings surface: `desktop/src/main.js:2360`
- Browser coverage: `desktop/tests/browser/workflow-pages.spec.mjs:176`, `desktop/tests/browser/workflow-pages.spec.mjs:181`, `desktop/tests/browser/workflow-pages.spec.mjs:185`
- Static smoke coverage: `desktop/tests/static-smoke.mjs:40`

## Verification

- `cargo fmt --check`
- `cargo test module_registry`
- `cargo test`
- `npm test`
- `npm run test:browser`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

- Browser tests verify the selector and browser-preview path. Tauri command persistence is covered by Rust `first_run` and `module_registry` tests; full desktop/installer clean-machine evidence remains a later end-stage gate.
