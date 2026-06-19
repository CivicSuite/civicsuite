# Audit Lite - Windows Module Backup-First Removal

**Scope:** Align module manager removal with the manifest promise that module removal is backup-first.
**Reviewer:** Codex (audit-lite)
**Date:** 2026-06-13

## Findings

No open Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence Reviewed

- `desktop/src-tauri/src/main.rs:395` now creates a supervisor backup before removing an installed module from the active profile.
- `desktop/src-tauri/src/main.rs:457` reports that removal happened after a verified profile backup and that existing module data was not deleted.
- `desktop/src-tauri/src/main.rs:761` verifies the command path, the removal message, the backup manifest folder, and the post-removal export guard.
- `desktop/src/main.js:2500` explains the backup-first removal sequence before the user confirms.
- `desktop/tests/browser/workflow-pages.spec.mjs:216` verifies the guided review copy in the module manager.

## Verification

- `cargo fmt` passed.
- `cargo check` passed with no warnings.
- `cargo test module_actions_require_admin_after_first_admin_exists -- --test-threads=1` passed.
- `cargo test -- --test-threads=1` passed: 95 tests.
- `npm test` passed.
- `npm run test:browser -- --grep "module manager"` passed.
- `npm run test:browser` passed: 11 tests.
- `npm run build` passed.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\docs\verify_docs_truth.py` passed.

## Residual Risk

Clean-machine MSI install/reboot/uninstall evidence was not rerun for this slice because the change is confined to the already-tested desktop module manager command path and reuses the existing supervisor backup implementation.
