# Audit Lite - Windows Custom Module Selection - 2026-06-13

Scope: Windows Local 1.0 module-manager contract for future custom module selection.

## Findings

No unresolved findings.

## Evidence

- Custom selections now resolve through the same registry as named profiles, always include CivicCore, walk dependencies in order, reject cycles, and validate selected modules against the Windows Local installable-module contract. Evidence: `desktop/src-tauri/src/module_registry.rs:370`.
- Saved custom selections are validated on reload before being accepted as app state. Evidence: `desktop/src-tauri/src/module_registry.rs:439`, `desktop/src-tauri/src/module_registry.rs:538`, `desktop/src-tauri/src/module_registry.rs:545`.
- The first-run `select-modules` action still defaults to City Core, but can accept a validated custom payload with selected module ids. Evidence: `desktop/src-tauri/src/first_run.rs:433`, `desktop/src-tauri/src/first_run.rs:760`, `desktop/src-tauri/src/first_run.rs:765`.
- Regression coverage proves custom selection locks CivicCore, persists and reloads selected ready modules, marks omitted modules uninstalled, rejects empty selections, rejects planned modules with no runtime repo, rejects modules that do not satisfy the Windows Local CivicCore 1.2.0 contract, and accepts the same payload through first-run. Evidence: `desktop/src-tauri/src/module_registry.rs:695`, `desktop/src-tauri/src/module_registry.rs:734`, `desktop/src-tauri/src/first_run.rs:961`.

## Verification

- `cargo test selection` passed: 7 passed.
- `cargo test` passed: 79 passed.

## Residual Risk

The clerk-facing UI still defaults to City Core for 1.0. A later UI slice can expose module checkboxes once additional modules have passed their package and proof gates.
