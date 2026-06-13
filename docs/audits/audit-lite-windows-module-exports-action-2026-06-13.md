# Audit Lite - Windows Module Exports Action

**Scope:** Module manager access to real local export folders for CivicClerk, CivicRecords AI, and CivicCode in the Tauri/WebView2 desktop shell.
**Reviewer:** Codex (audit-lite)
**Date:** 2026-06-13

## Findings

No open Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Closed During Audit

### Closed - Major: Module action results used stale module summaries after mutation

**Evidence:** `desktop/src-tauri/src/main.rs:396` mutates module state for the command action, and the result now reloads summaries after the action before returning them to the renderer. The regression test at `desktop/src-tauri/src/main.rs:694` verifies disable, update, open exports, remove, and reinstall behavior from the same command boundary.

**Impact:** Before the fix, a UI refresh after enable/disable could receive stale installed/enabled flags even though the registry mutation succeeded.

**Fix:** Resolve the display name before action execution, then reload `module_summaries()` after the mutation.

## Verification

- `cargo fmt` passed.
- `cargo check` passed with no warnings.
- `cargo test -- --test-threads=1` passed: 95 tests.
- `npm test` passed.
- `npm run test:browser` passed: 11 tests.
- `npm run build` passed.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\docs\verify_docs_truth.py` passed.
- `python scripts\policy\check_stage_evidence.py` passed for this non-stage branch.

## Residual Risk

Clean-machine MSI install/reboot/uninstall evidence was not rerun for this slice because the change adds a desktop command and renderer control over existing profile export directories; it does not alter installer packaging, runtime payloads, or service lifecycle.
