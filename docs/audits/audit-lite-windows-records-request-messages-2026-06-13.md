# Audit Lite: Windows Records Request Messages

Scope: CivicRecords request message thread, staff/requester message actions, requester lookup privacy boundary, export/search evidence, and desktop UI wiring.

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend request state now persists a typed `RecordsMessage` thread with author, role, visibility, body, and timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:109`, `desktop/src-tauri/src/workflows.rs:168`.
- Staff message action saves requester-visible messages, adds a timeline entry, queues a requester notification, and writes a CivicRecords audit entry. Evidence: `desktop/src-tauri/src/workflows.rs:1927`, `desktop/src-tauri/src/workflows.rs:1963`.
- Public requester message action verifies request number plus submitted contact, writes the message, queues a staff notification, saves state, and returns only a public-safe matched request projection. Evidence: `desktop/src-tauri/src/workflows.rs:1972`, `desktop/src-tauri/src/workflows.rs:2036`, `desktop/src-tauri/src/workflows.rs:2046`.
- General public Records projection clears request messages; matched request lookup projection includes only `requester thread` messages. Evidence: `desktop/src-tauri/src/workflows.rs:3392`, `desktop/src-tauri/src/workflows.rs:3396`.
- Tauri command boundary registers both message actions under CivicRecords and preserves the public-safe message result instead of re-projecting it away. Evidence: `desktop/src-tauri/src/main.rs:155`, `desktop/src-tauri/src/main.rs:565`.
- Messages are included in local AI response context, exports, staff search, and tests. Evidence: `desktop/src-tauri/src/workflows.rs:2292`, `desktop/src-tauri/src/workflows.rs:2391`, `desktop/src-tauri/src/workflows.rs:4135`, `desktop/src-tauri/src/workflows.rs:4178`.
- Desktop UI exposes staff and public message controls, guided review for staff messages, verified public message rendering, payload wiring, and static/browser guards. Evidence: `desktop/src/main.js:1563`, `desktop/src/main.js:2209`, `desktop/src/main.js:2277`, `desktop/src/main.js:2340`, `desktop/src/main.js:3744`, `desktop/tests/browser/workflow-pages.spec.mjs:43`, `desktop/tests/static-smoke.mjs:68`.

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

Clean-machine MSI install, reboot survival, uninstall/reinstall, and clerk walkthrough evidence were not rerun for this small slice. That remains an end-stage test-machine gate, not an unresolved finding for request-message implementation.
