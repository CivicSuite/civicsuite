# Audit Lite: Windows Module Install Remove Lifecycle

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/module_registry.rs`, `desktop/src-tauri/src/main.rs`, `desktop/src/main.js`, `desktop/src/styles.css`, `desktop/tests/browser/workflow-pages.spec.mjs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/module_registry.rs:451` builds validated module selections from installed/enabled module ids, keeping CivicCore installed and preserving enabled/disabled state.
- `desktop/src-tauri/src/module_registry.rs:752` adds install/remove lifecycle transitions for contract-ready modules while blocking required or not-ready modules.
- `desktop/src-tauri/src/module_registry.rs:1055` verifies a product module can be removed from the active profile and reinstalled without deleting local module data.
- `desktop/src-tauri/src/module_registry.rs:1093` verifies lifecycle boundaries for planned modules and required CivicCore removal.
- `desktop/src-tauri/src/main.rs:383` wires `install-module`, `remove-module`, and `update-module` through the Tauri command boundary.
- `desktop/src-tauri/src/main.rs:428` returns plain-English remove copy that states existing module data was not deleted.
- `desktop/src-tauri/src/main.rs:702` verifies update, remove, and reinstall command results after local admin sign-in.
- `desktop/src/main.js:2380` exposes install, update, enable/disable, and remove controls from module state instead of static labels.
- `desktop/tests/browser/workflow-pages.spec.mjs:211` verifies the Settings module manager shows update and remove actions for CivicCode.
- `desktop/tests/static-smoke.mjs:302` guards the new command-boundary lifecycle phrases.

## Verification

- `cargo fmt --check`
- `cargo test module -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice makes module lifecycle controls real for the local profile registry and current desktop command path. It intentionally preserves module data on removal rather than deleting it; full per-module export/delete choices and clean-machine MSI evidence remain part of the broader Windows Local 1.0 release gate.
