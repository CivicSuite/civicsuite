# Audit Lite: Windows Local AI Generation Bounds

Date: 2026-06-19

Scope: Fix for `TESTER-RESULT-100.md`, where installed-product CivicRecords, CivicCode, and CivicClerk local AI actions timed out while bundled Ollama was still decoding the pinned Gemma model.

## Findings

No findings.

## Evidence

- `desktop/src-tauri/src/model.rs` now builds the Ollama `/api/generate` request through a bounded helper with `num_predict`, `num_ctx`, a concise staff-review prompt suffix, and the existing 180-second product timeout.
- `desktop/src-tauri/src/model.rs` includes `local_generation_request_bounds_slow_ollama_outputs`, proving the shipped request body carries the bounded generation options.
- `desktop/tests/static-smoke.mjs` checks the local generation contract includes `/api/generate`, `num_predict`, and the context bound.

## Verification

- `cargo fmt --check`
- `cargo test local_generation_request_bounds_slow_ollama_outputs`
- `npm --prefix desktop test -- --runInBand`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive`
- `cargo test records_workflow_requires_human_approval_before_release`
- `cargo test code_workflow_persists_source_handoff_and_search`
- `cargo test`

## Residual Risk

The remaining material risk is real clean-machine latency with the 12B Gemma model on the Windows tester. That cannot be fully proven by the fake-response workflow tests, so the next tester directive must rerun the installed-product AI workflow proof against bundled Ollama.
