# Audit Lite: Windows Clerk Notice Posting Evidence

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: CivicClerk notice posting evidence

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: `post-notice` now requires posting location, method, and confirmation before marking a notice ready; the evidence is persisted on the meeting, included in the audit entry, exported in meeting packet/archive contents, and included in local AI minutes drafting context.
- `desktop/src-tauri/src/main.rs`: public projection test fixture updated to satisfy the new durable notice evidence contract.
- `desktop/src/main.js`: Meetings & Notices now exposes notice evidence inputs, includes evidence in guided review, submits evidence to the desktop bridge, and displays saved evidence on meeting summaries.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs`: browser/static coverage now asserts the visible notice evidence controls and backend contract phrases.
- `docs/installer/operator-walkthrough.md`: operator walkthrough now includes notice posting evidence in the clerk smoke path.

## Verification

- `cargo fmt`
- `cargo test -- --test-threads=1` - 95 passed
- `cargo check`
- `npm test`
- `npm run test:browser` - 11 passed
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\docs\verify_docs_truth.py`
- `python scripts\policy\check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice captures and preserves clerk-entered notice posting evidence. It does not implement jurisdiction-specific statutory deadline/rule calculation for every municipality; that remains broader CivicClerk release work and should be handled as a separate product slice.
