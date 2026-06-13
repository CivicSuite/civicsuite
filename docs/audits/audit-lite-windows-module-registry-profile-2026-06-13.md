# Audit Lite: Windows Module Registry Profile

Date: 2026-06-13
Scope: City Core module contract metadata, desktop module registry validation, and local module selection state.

## Findings

No findings.

## Evidence

- Installable City Core modules now declare routes, permissions, services, migrations, tasks, backup/restore hooks, model needs, lifecycle behavior, and proof requirements in `installer/modules.json:159`, `installer/modules.json:249`, `installer/modules.json:333`, and `installer/modules.json:420`.
- The desktop registry validator enforces the Windows Local 1.0 contract for installable modules in `desktop/src-tauri/src/module_registry.rs:246`.
- The selected module profile is persisted locally by `desktop/src-tauri/src/module_registry.rs:406` and read into app state by `desktop/src-tauri/src/module_registry.rs:413`.
- First-run module selection now writes the same local profile state in `desktop/src-tauri/src/first_run.rs:511`.
- App state now exposes module profiles and the selected module profile in `desktop/src-tauri/src/main.rs:31` and `desktop/src-tauri/src/main.rs:107`.
- Settings displays selected profile state from app data in `desktop/src/main.js:979` and `desktop/src/main.js:1020`.
- Browser coverage checks the selected City Core profile text in `desktop/tests/browser/workflow-pages.spec.mjs:61`.

## Verification

- `cargo test` passed: 45 passed, no warnings.
- `npm test` passed.
- `npm run build` passed.
- `npm run test:browser` passed: 8 passed.
- `git diff --check` passed.

## Residual Risk

- This slice gives Windows Local 1.0 a durable module profile and strict installable-module contract. It does not yet implement in-app download/update of future module packages; that remains a later module-manager lifecycle slice built on this registry state.
