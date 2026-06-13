# Audit Lite: Windows Module Manager Catalog

Date: 2026-06-13

Scope:
- `desktop/src-tauri/src/module_registry.rs`
- `desktop/src/main.js`
- `desktop/tests/browser/workflow-pages.spec.mjs`
- `desktop/tests/static-smoke.mjs`

## Findings

No unresolved findings.

## Evidence Reviewed

- `desktop/src-tauri/src/module_registry.rs:28` and `desktop/src-tauri/src/module_registry.rs:120` expose profile disabled reasons from the module registry.
- `desktop/src-tauri/src/module_registry.rs:45` and `desktop/src-tauri/src/module_registry.rs:96` expose per-module installer status for future module manager surfaces.
- `desktop/src-tauri/src/module_registry.rs:494` through `desktop/src-tauri/src/module_registry.rs:506` expose route, service, permission, task, lifecycle, and model requirements from `installer/modules.json`.
- `desktop/src-tauri/src/module_registry.rs:591` validates that summaries expose installed city-core contract data and a future-module status.
- `desktop/src/main.js:520` labels non-installed selectable modules as `Package waiting`, avoiding a misleading install-ready claim.
- `desktop/src/main.js:1920` renders profile rows from the manifest-backed profile catalog.
- `desktop/src/main.js:1988` and `desktop/src/main.js:1995` render separate `Package Profiles` and `Module Catalog` sections.
- `desktop/tests/browser/workflow-pages.spec.mjs:175` through `desktop/tests/browser/workflow-pages.spec.mjs:184` verify the Settings module manager shows profile/catalog surfaces, Full Suite, CivicZone, and the package-waiting state without stale “Not ready” or scaffold copy.
- `desktop/tests/static-smoke.mjs:38` guards the module manager headings.

## Verification

- `cargo test module_registry -- --nocapture`: passed, 5 tests.
- `npm test`: passed.
- `npx playwright test tests/browser/workflow-pages.spec.mjs -g "module manager"`: passed, 1 test.
- `cargo test`: passed, 66 tests.
- `npm run test:browser`: passed, 10 tests.
- `cargo fmt --check`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts/policy/check_stage_evidence.py`: passed.
- `git diff --check`: passed.

## Residual Risk

This slice exposes the future-module package/profile contract and keeps the UI honest about non-installed modules, but it does not make future modules installable before their package proof exists. That matches the Windows Local 1.0 scope: city-core installs now; future modules must enter through the same manifest, lifecycle, proof, backup, and model contract before they become selectable.
