# Audit Lite - Windows Records Public Intake

Date: 2026-06-13

Scope: Public records request intake in the Windows-local desktop shell, including backend workflow state, Resident/Public UI, Staff Records visibility, and browser coverage.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Fixed During Audit

- High - The first public status list draft would have shown all pending Resident/Public intake requests, including requester names and summaries, to anyone opening the public surface. Fixed by requiring an exact request-number lookup for pending public intake while still allowing fulfilled/closed released responses to appear publicly. Evidence: `desktop/src/main.js:1308`, `desktop/src/main.js:1345`, `desktop/src/main.js:1346`, `desktop/tests/browser/workflow-pages.spec.mjs:71`.

## Evidence

- Backend state now stores public tracking number, requester contact, and submission source with serde defaults for old saved workflow files. Evidence: `desktop/src-tauri/src/workflows.rs:46`.
- The new `submit-public-records-request` action creates a durable local CivicRecords request, assigns `REQ-0001` style tracking, keeps fulfillment/approval empty, and appends an audit-chain entry. Evidence: `desktop/src-tauri/src/workflows.rs:873`, `desktop/src-tauri/src/workflows.rs:1681`, `desktop/src-tauri/src/workflows.rs:1920`.
- Staff Records shows tracking, contact, and submission source so clerks can work public submissions through the existing assign/search/review/release lifecycle. Evidence: `desktop/src/main.js:1414`.
- Resident/Public Records now has a real request form and request-number status lookup without exposing staff controls. Evidence: `desktop/src/main.js:1335`, `desktop/src/main.js:2096`, `desktop/tests/browser/workflow-pages.spec.mjs:69`.

## Verification

- `cargo test workflows::tests::public_records_intake_creates_trackable_durable_request -- --nocapture`: pass.
- `cargo test -- --nocapture`: 62 passed.
- `npm test`: pass.
- `npm run test:browser`: 10 passed.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass with only expected Windows line-ending warnings.

## Residual Risk

- Browser preview cannot persist Tauri workflow mutations, so the UI save path is covered by backend action tests plus browser bridge-boundary tests. Full desktop persistence remains part of the clean-machine MSI walkthrough gate.
