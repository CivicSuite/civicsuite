# Audit Lite: Windows First-Run Model Download

Date: 2026-06-13

Scope:
- `desktop/src-tauri/src/first_run.rs`
- `desktop/src/main.js`
- `desktop/tests/static-smoke.mjs`

## Findings

No unresolved findings.

## Evidence Reviewed

- `desktop/src-tauri/src/first_run.rs:562` now treats the first-run `download-model` step as an executor path, not a passive confirmation.
- `desktop/src-tauri/src/first_run.rs:572` calls the real model setup action with `resume-download`, preserving the existing pinned download, checksum, and CivicCore model registry behavior.
- `desktop/src-tauri/src/first_run.rs:715` covers the failure path where low disk blocks before a large model download starts.
- `desktop/src-tauri/src/first_run.rs:728` covers the already verified model path and confirms the first-run model step advances only after verification.
- `desktop/src/main.js:593` changes the clerk-facing first-run action label to `Download / Resume Model`.
- `desktop/tests/static-smoke.mjs:35` guards that installer/setup copy.

## Verification

- `cargo test first_run_model -- --nocapture`: passed, 2 tests.
- `npm test`: passed.
- `npx playwright test tests/browser/model-readiness.spec.mjs`: passed, 4 tests.
- `npm run test:browser`: passed, 10 tests.
- `cargo test`: passed, 65 tests.
- `cargo fmt --check`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts/policy/check_stage_evidence.py`: passed.
- `git diff --check`: passed.

## Residual Risk

The test suite does not download the full 6.5+ GB Gemma artifact during normal local verification. That remains appropriate for the clean-machine gate; this slice verifies that first-run now invokes the same resumable/checksummed model setup path and that failure states do not advance setup.
