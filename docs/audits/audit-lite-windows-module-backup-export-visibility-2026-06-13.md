# Audit Lite - Windows Module Backup And Export Visibility

**Scope:** Surface module backup/restore coverage and export access in the Windows Local module manager.
**Reviewer:** Codex (audit-lite)
**Date:** 2026-06-13

## Findings

No open Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence Reviewed

- `desktop/src-tauri/src/module_registry.rs:107` exposes `backup_restore_hooks` on `ModuleSummary`.
- `desktop/src-tauri/src/module_registry.rs:912` populates the field from `installer/modules.json`.
- `desktop/src/main.js:2383` maps manifest paths to clerk-readable labels.
- `desktop/src/main.js:2437` renders `Backup includes:` in each module row when hooks are present.
- `desktop/tests/browser/workflow-pages.spec.mjs:210` verifies CivicCode shows backup coverage beside module actions.
- `docs/installer/operator-walkthrough.md` now asks operators to verify lifecycle, backup coverage, and export access state.

## Verification

- `cargo fmt` passed.
- `cargo check` passed with no warnings.
- `cargo test module_summaries_expose_contract_status_for_future_manager -- --test-threads=1` passed.
- `cargo test -- --test-threads=1` passed: 95 tests.
- `npm test` passed.
- `npm run test:browser -- --grep "module manager"` passed.
- `npm run test:browser` passed: 11 tests.
- `npm run build` passed.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\docs\verify_docs_truth.py` passed.

## Residual Risk

Clean-machine MSI install evidence was not rerun for this UI/contract visibility slice. The runtime backup implementation itself is covered by the supervisor backup tests and by the prior backup-first module-removal slice.
