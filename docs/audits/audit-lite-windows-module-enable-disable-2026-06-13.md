# Audit Lite: Windows Module Enable/Disable Lifecycle

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: Installed-versus-enabled module state, desktop module action command, and navigation filtering.

## Findings

None.

Severity counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

## Evidence Reviewed

- `desktop/src-tauri/src/module_registry.rs:135` adds `enabled_module_ids` as backward-compatible persisted module-selection state.
- `desktop/src-tauri/src/module_registry.rs:484` validates enabled modules against installed modules, required CivicCore state, and dependency ordering.
- `desktop/src-tauri/src/module_registry.rs:628` toggles product modules without removing them from `installed_module_ids`.
- `desktop/src-tauri/src/module_registry.rs:875` verifies CivicCode can be disabled and re-enabled while remaining installed, and CivicCore cannot be disabled.
- `desktop/src-tauri/src/main.rs:254` exposes the local-admin-gated `module_action` desktop command.
- `desktop/src-tauri/src/main.rs:486` verifies signed-out module changes are rejected after first admin creation and signed-in local admin changes update enabled state.
- `desktop/src/main.js:634` maps work areas to enabled product modules, and `desktop/src/main.js:643` filters primary navigation from that enabled state.
- `desktop/src/main.js:2288` renders installed module rows with enabled/disabled status and reversible module actions.
- `desktop/src/main.js:2883` invokes the desktop module action and blocks browser-preview persistence with plain-English copy.
- `desktop/tests/browser/workflow-pages.spec.mjs:200` verifies the module manager exposes enabled-module counts and the CivicCode disable action in browser walkthrough coverage.
- `desktop/tests/static-smoke.mjs:173` guards the frontend/backend command wiring.

## Verification

- `cargo fmt --check` passed in `desktop/src-tauri`.
- `cargo test` passed in `desktop/src-tauri`: 83 passed, 0 failed.
- `npm test` passed in `desktop`: static smoke checks passed.
- `npm run test:browser -- workflow-pages.spec.mjs` passed in `desktop`: 6 passed.
- `npm run test:browser` passed in `desktop`: 11 passed.
- `git diff --check` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.

## Residual Risk

This slice does not add downloadable module packages or clean-machine install evidence. It completes the local installed-versus-enabled lifecycle foundation for the current city-core package and keeps future package download/install work on the same module registry contract.
