# Audit Lite - Windows Publication Event Ledger

Date: 2026-06-13
Scope: CivicCore publication-event ledger slice for Windows Local 1.0 city workflows across CivicClerk, CivicRecords AI, and CivicCode.

## Findings

No unresolved findings.

## Coverage

- City workflow state now includes a durable `publication_events` collection with source module, source record, record type, public payload, SHA-256 payload hash, publish timestamp, and retraction metadata. Evidence: `desktop/src-tauri/src/workflows.rs:138`, `desktop/src-tauri/src/workflows.rs:170`.
- Publication helpers hash public payloads and append/retract events without deleting historical release records. Evidence: `desktop/src-tauri/src/workflows.rs:363`, `desktop/src-tauri/src/workflows.rs:385`.
- CivicClerk archive, CivicRecords fulfillment, and CivicCode publish now create publication events only after their existing human-review gates pass. Evidence: `desktop/src-tauri/src/workflows.rs:715`, `desktop/src-tauri/src/workflows.rs:991`, `desktop/src-tauri/src/workflows.rs:1214`.
- CivicCode unpublish now retracts the latest live publication event for the source while keeping the original event and payload hash. Evidence: `desktop/src-tauri/src/workflows.rs:1288`.
- Desktop audit drawer now separates publication gates from workflow actions and displays source module, record type, live/retracted state, record id, and payload hash. Evidence: `desktop/src/main.js:1417`, `desktop/src/main.js:1424`, `desktop/src/main.js:1435`.
- Regression coverage asserts publication creation/retraction for meeting archive, records fulfillment, code publish, and code unpublish, plus browser visibility of the publication-gate drawer section. Evidence: `desktop/src-tauri/src/workflows.rs:1624`, `desktop/src-tauri/src/workflows.rs:1711`, `desktop/src-tauri/src/workflows.rs:1776`, `desktop/src-tauri/src/workflows.rs:1809`, `desktop/tests/browser/workflow-pages.spec.mjs:105`.

## Verification

- `cargo test`: pass, 60 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 9 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- The ledger is local durable application state with payload hashes and retraction history. It is not yet a separate WORM storage layer or external public portal feed; those are outside this slice and should be handled when the publication/archive subsystem is expanded beyond the local desktop profile.
