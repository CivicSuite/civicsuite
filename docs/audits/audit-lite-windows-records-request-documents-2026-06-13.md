# Audit Lite: Windows Records Request Documents

Scope: CivicRecords request document attachment, local file copy/hash evidence, staff-only document metadata, export/search evidence, and desktop UI wiring.

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend request state now persists `RecordsDocument` metadata for source path, copied local path, citation, SHA-256, file size, status, and timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:119`, `desktop/src-tauri/src/workflows.rs:184`.
- Document attachment validates an existing local file, copies it into the local city profile, hashes the stored copy, records citation evidence, updates timeline, and writes a CivicRecords audit entry. Evidence: `desktop/src-tauri/src/workflows.rs:674`, `desktop/src-tauri/src/workflows.rs:2165`, `desktop/src-tauri/src/workflows.rs:2214`.
- Attached documents are included in local AI response context, response exports, staff search, and tests. Evidence: `desktop/src-tauri/src/workflows.rs:2437`, `desktop/src-tauri/src/workflows.rs:2537`, `desktop/src-tauri/src/workflows.rs:4323`, `desktop/src-tauri/src/workflows.rs:4374`.
- Public Records projection strips attached document metadata so source paths and hashes are not exposed through public status/search. Evidence: `desktop/src-tauri/src/workflows.rs:3556`.
- Tauri command boundary registers the document action under CivicRecords module enablement. Evidence: `desktop/src-tauri/src/main.rs:155`, `desktop/src-tauri/src/workflows.rs:3708`.
- Desktop UI exposes Request Documents fields and button, renders attached document evidence on staff request cards, sends action payloads, and protects the strings with browser/static smoke tests. Evidence: `desktop/src/main.js:2301`, `desktop/src/main.js:2370`, `desktop/src/main.js:3801`, `desktop/tests/browser/workflow-pages.spec.mjs:46`, `desktop/tests/static-smoke.mjs:73`.

## Verification

- `cargo fmt`
- `cargo test records_workflow_requires_human_approval_before_release -- --test-threads=1`
- `cargo test public_records_intake_creates_trackable_durable_request -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `cargo check`
- `npm test`
- `npm run test:browser`
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `python scripts\verify-deployment-profile.py --static-only`
- `git diff --check`

## Residual Risk

Clean-machine MSI install, reboot survival, uninstall/reinstall, and clerk walkthrough evidence were not rerun for this small slice. That remains an end-stage test-machine gate, not an unresolved finding for request-document implementation.
