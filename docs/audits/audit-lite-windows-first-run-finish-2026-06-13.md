# Audit Lite: Windows First-Run Finish

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/first_run.rs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/first_run.rs:416` adds a prior-required-step check for finish gating.
- `desktop/src-tauri/src/first_run.rs:710` blocks `open-app` when required setup steps are still incomplete.
- `desktop/src-tauri/src/first_run.rs:808` returns explicit finished-product copy instead of generic saved-progress copy.
- `desktop/src-tauri/src/first_run.rs:919` verifies early finish does not complete first-run setup.
- `desktop/src-tauri/src/first_run.rs:934` verifies a completed setup finishes the Windows local profile and points staff to city work.
- `desktop/tests/static-smoke.mjs:280` guards the finish-gate and finish-success copy.

## Verification

- `cargo fmt --check`
- `cargo test first_run::tests::first_run_finish -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice hardens the local first-run completion contract. It does not replace the clean-machine installer walkthrough gate; that still needs MSI install/reboot/uninstall evidence when the Windows build artifact is ready.
