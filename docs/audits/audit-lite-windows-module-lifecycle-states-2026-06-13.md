# Audit Lite: Windows Module Lifecycle States

Date: 2026-06-13

Scope: Module manager lifecycle visibility in the Windows desktop Settings surface, including module-summary contract data, browser fallback state, and clerk-readable lifecycle text.

## Findings

No open findings.

## Fixed During Audit

- Medium - The first UI pass depended on backend lifecycle fields, but the browser-preview fallback state did not include those fields. That made the Settings walkthrough miss the lifecycle state text even though the Tauri app would receive it. Fixed by adding lifecycle install/update/disable/uninstall values to the fallback City Core module records. Evidence: `desktop/src/main.js:24`, `desktop/src/main.js:37`, `desktop/src/main.js:50`, `desktop/src/main.js:67`.

## Evidence Reviewed

- `desktop/src-tauri/src/module_registry.rs`: `ModuleSummary` now exposes `lifecycle_update` in addition to install, disable, and uninstall.
- `desktop/src/main.js`: module rows translate manifest lifecycle values into clerk-readable install, update, disable, and remove states.
- `desktop/tests/browser/workflow-pages.spec.mjs`: Settings walkthrough proves the City Core module manager shows friendly lifecycle states and does not show raw manifest strings.

## Verification

- `cargo test module_summaries_expose_contract_status_for_future_manager` from `desktop/src-tauri` passed.
- `npm run test:browser` from `desktop` passed: 11 passed.
- `npm test` from `desktop` passed: desktop static smoke checks.
- `git diff --check` passed before adding this audit record.

## Residual Risk

- This slice exposes module lifecycle state; it does not implement live per-module install/disable/update actions. Those actions still depend on the future module package gate and cleanroom proof flow.
