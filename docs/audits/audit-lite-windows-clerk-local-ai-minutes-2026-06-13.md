# Audit Lite - CivicClerk Local AI Minutes Draft

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Scope: local AI minutes draft generation for CivicClerk inside the Windows desktop Meetings & Notices workflow.

## Findings

No findings.

Severity counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

## Evidence

- `desktop/src-tauri/src/main.rs:141` keeps `suggest-minutes-draft` behind the CivicClerk module ownership guard.
- `desktop/src-tauri/src/workflows.rs:739` adds `suggest_minutes_draft`, requires a mutable non-archived meeting, blocks adopted minutes, requires meeting evidence, calls the verified local model path, and saves output only as a minutes draft.
- `desktop/src-tauri/src/workflows.rs:824` records a CivicClerk audit event naming the model and preserving that adoption still requires human review.
- `desktop/src-tauri/src/workflows.rs:2463` wires the action into the durable city workflow dispatcher.
- `desktop/src/main.js:1408` adds the guided review panel that states generation is internal, does not adopt/archive, and requires clerk review before public archive.
- `desktop/src/main.js:1825` exposes the clerk-facing `Generate Local AI Minutes` control in Meetings & Notices.
- `desktop/tests/browser/workflow-pages.spec.mjs:15` verifies the control is visible.
- `desktop/tests/browser/workflow-pages.spec.mjs:141` verifies guided review opens before generation.
- `desktop/src-tauri/src/workflows.rs:2655` tests the generated minutes draft is persisted, then adopted and archived only through the existing workflow.

## Validation

- `cargo fmt`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` - passed
- `cargo check`
- `npm test` - desktop static smoke passed
- `npm run test:browser -- --grep "city workflow pages expose real local task controls|risky city workflow actions require guided review before mutation"` - 2 passed
- `cargo test -- --test-threads=1` - 95 passed
- `npm run test:browser` - 11 passed
- `npm run build` - Vite production build passed
- `python scripts\verify-module-manifest-contract.py` - passed
- `python scripts\docs\verify_docs_truth.py` - passed
- `python scripts\policy\check_stage_evidence.py` - passed, branch is not a stage branch
- `git diff --check` - no whitespace errors; Windows line-ending warnings only

## Residual Risk

The clean-machine proof still needs a real pinned Gemma 4 12B QAT runtime generation pass. This slice verifies the product wiring and safety gates with the existing test-only fake model response.
