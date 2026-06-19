# Audit Lite: Windows Records Fee Detail

Scope: Records request fee schedules/basis, fee line items, fee waiver evidence, desktop UI wiring, public/staff boundary, export/search evidence.

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend state now stores structured `RecordsFeeLineItem` records with description, required schedule/policy basis, amount in cents, and timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:109`, `desktop/src-tauri/src/workflows.rs:113`.
- Backend command validation rejects invalid money input and requires fee schedule/policy basis before saving a fee line. Evidence: `desktop/src-tauri/src/workflows.rs:477`, `desktop/src-tauri/src/workflows.rs:1992`, `desktop/src-tauri/src/workflows.rs:1997`.
- Fee lines and waivers flow through the same durable Records workflow command path, audit chain, timeline, export, and enabled-module guard. Evidence: `desktop/src-tauri/src/workflows.rs:2038`, `desktop/src-tauri/src/workflows.rs:2055`, `desktop/src-tauri/src/workflows.rs:2218`, `desktop/src-tauri/src/workflows.rs:3349`.
- Public Records status projection strips staff-only fee line items and waiver evidence. Evidence: `desktop/src-tauri/src/workflows.rs:3201`, `desktop/src-tauri/src/workflows.rs:4104`.
- Desktop UI exposes fee description, schedule/policy basis, amount, waiver reason, guided reviews, and payloads for the new actions. Evidence: `desktop/src/main.js:1560`, `desktop/src/main.js:1570`, `desktop/src/main.js:2281`, `desktop/src/main.js:2282`, `desktop/src/main.js:3705`.
- Desktop local search includes fee line descriptions, schedule/policy basis, waiver reason, and formatted amount for staff search only. Evidence: `desktop/src/main.js:2546`, `desktop/src/main.js:2564`.
- Tests cover fee validation, schedule basis persistence, export evidence, staff search, public stripping, browser UI controls, guided review warnings, and static UI release guards. Evidence: `desktop/src-tauri/src/workflows.rs:3881`, `desktop/src-tauri/src/workflows.rs:3929`, `desktop/src-tauri/src/workflows.rs:3965`, `desktop/tests/browser/workflow-pages.spec.mjs:39`, `desktop/tests/browser/workflow-pages.spec.mjs:190`, `desktop/tests/static-smoke.mjs:57`.

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

Clean-machine MSI install, reboot survival, uninstall/reinstall, and clerk walkthrough evidence were not rerun for this small slice. That remains an end-stage test-machine gate, not an unresolved finding for the fee-detail implementation.
