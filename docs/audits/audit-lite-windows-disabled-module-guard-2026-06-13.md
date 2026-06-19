# Audit Lite: Windows Disabled Module Guard

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src-tauri/src/main.rs`, `desktop/src/main.js`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src-tauri/src/main.rs:131` maps city-work actions to owning module ids, with cross-module actions requiring at least one enabled city-work module.
- `desktop/src-tauri/src/main.rs:200` blocks owned workflows when their module is disabled in the local profile and returns plain-English re-enable guidance.
- `desktop/src-tauri/src/main.rs:443` enforces the module guard at the Tauri command boundary before mutating city-work state.
- `desktop/src-tauri/src/main.rs:446` filters cross-module search results to enabled modules before returning them to the desktop shell.
- `desktop/src-tauri/src/main.rs:652` verifies a disabled CivicCode module blocks an owned code workflow.
- `desktop/src-tauri/src/main.rs:675` verifies cross-module search remains usable while excluding disabled module results.
- `desktop/src/main.js:2311` keeps browser-preview search aligned with enabled module state.
- `desktop/tests/static-smoke.mjs:292` guards the command-boundary enforcement phrases so the behavior cannot be removed silently.

## Verification

- `cargo fmt --check`
- `cargo test disabled_modules -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice makes module disablement real for the current local city-work command path and browser-preview search. It does not yet add a clean-machine walkthrough showing an installed MSI profile disabling and re-enabling modules; that remains part of the Windows Local 1.0 installer walkthrough gate.
