# Audit Lite: Windows Records Request Timeline

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: CivicRecords AI durable request timeline

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added `RecordsTimelineEntry`, persisted timeline entries for Records intake, deadline review, clarification, assignment, search, exemption review, fee estimate, drafting, local AI drafting, approval, export, fulfillment, and closure.
- `desktop/src-tauri/src/workflows.rs`: included the request timeline in staff search and response exports, while clearing timeline entries from public/requester projections.
- `desktop/src/main.js`: added expandable Request Timeline UI on staff Records cards and included timeline notes in browser-preview staff search.
- `desktop/src/styles.css`: added compact case-file styling for timeline details.
- `desktop/tests/static-smoke.mjs`: added Request Timeline as a required desktop phrase.
- `docs/installer/operator-walkthrough.md`: added Request Timeline review to the Records clerk smoke path.

## Verification

- `cargo fmt`
- `cargo test workflows::tests::public_records_intake_creates_trackable_durable_request -- --test-threads=1`
- `cargo test workflows::tests::records_workflow_requires_human_approval_before_release -- --test-threads=1`
- `cargo test -- --test-threads=1` - 95 passed
- `cargo check`
- `npm test`
- `npm run test:browser` - 11 passed
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `git diff --check`

## Residual Risk

The timeline is staff-facing and intentionally scrubbed from public/requester projections because entries may contain staff notes, exemption review language, or internal search details. A future requester-safe status timeline should use a separate public-summary contract rather than exposing this staff case history directly.
