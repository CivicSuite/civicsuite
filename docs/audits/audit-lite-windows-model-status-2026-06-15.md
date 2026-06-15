# Audit Lite: Windows Model Readiness Status

Date: 2026-06-15
Scope: Local AI model readiness status shown by the Windows Local desktop shell.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src-tauri/src/model.rs:1218` now maps the model's overall status from the actual readiness boundary instead of collapsing every non-ready state to `Needs download`.
- `desktop/src-tauri/src/model.rs:1248` returns the refined status through `model_state`, which is the Tauri state consumed by Home, first-run, and System Health model readiness UI.
- `desktop/src-tauri/src/model.rs:1587` covers the present-but-unverified model file state as `Needs verification`.
- `desktop/src-tauri/src/model.rs:1608` covers the verified-file-but-runtime-missing state as `Needs runtime`.
- `desktop/tests/static-smoke.mjs:414` guards the model status mapper and operator-facing status phrases.

## Verification Evidence

- `cargo test model_state_reports -- --test-threads=1 --nocapture`: passed, 3 tests after a longer build timeout.
- `cargo test model -- --test-threads=1`: passed, 24 focused model/first-run/supervisor/app-state tests.
- `cargo test -- --test-threads=1`: passed, 110 tests.
- `cargo check`: passed.
- `npm test`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice improves readiness truth and regression coverage. It does not replace the clean-machine proof that a real Windows install can download, verify, load, and use the full Gemma 4 12B QAT artifact through the packaged runtime.
