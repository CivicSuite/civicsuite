# Audit Lite: Windows Records Deadline Review

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: CivicRecords AI deadline review and basis evidence

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added durable deadline basis and review timestamp fields for records requests; staff-created requests validate deadline dates; public-submitted requests can be reviewed later with `set-records-deadline`.
- `desktop/src-tauri/src/workflows.rs`: deadline review rejects missing basis and invalid calendar dates, records an audit entry, updates requester-visible status, includes basis in exports, and adds deadline basis to local search.
- `desktop/src-tauri/src/main.rs`: CivicRecords AI module guard now covers `set-records-deadline`.
- `desktop/src/main.js`: Records workflow now exposes deadline basis, a guided Set Deadline action, deadline-basis display in staff and requester cards, payload wiring, and browser-preview search coverage.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs`: UI/static coverage now asserts the deadline-basis field, Set Deadline control, guided review, and backend contract strings.
- `docs/installer/operator-walkthrough.md`: operator smoke path now includes deadline and basis review.

## Verification

- `cargo fmt`
- `cargo test public_records_intake_creates_trackable_durable_request -- --test-threads=1`
- `cargo test records_workflow_requires_human_approval_before_release -- --test-threads=1`
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

This slice records a clerk-reviewed deadline and basis. It does not compute a statutory deadline automatically from jurisdiction-specific calendars; that remains part of the broader CivicCore/CivicRecords statutory-rule work.
