# Audit Lite: Windows Records Public Status Updates

Date: 2026-06-14
Branch: `work/windows-local-1-design-contract`
Slice: requester-safe CivicRecords AI public status updates

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added a separate durable `RecordsPublicStatusEvent` contract for requester-safe status updates, populated it from allowlisted Records workflow milestones, preserved it in public/requester lookup projections, and kept staff timeline data scrubbed from public projections.
- `desktop/src/main.js`: added public and staff readback for `Status Updates`, included public status events in safe public search fields, and retained requester lookup/contact matching before pending requests render.
- `desktop/tests/static-smoke.mjs`: added static guards for the Status Updates surface and renderer.
- `docs/installer/operator-walkthrough.md`: updated the Records clerk and Resident/Public walkthrough expectations for safe status updates.

## Verification

- `cargo check`
- `cargo test public_records_intake_creates_trackable_durable_request -- --test-threads=1`
- `cargo test records_workflow_requires_human_approval_before_release -- --test-threads=1`
- `cargo test workflow_actions_target_selected_records_when_ids_are_supplied -- --test-threads=1`
- `cargo test -- --test-threads=1` - 96 passed
- `npm test -- --runInBand`
- `npm run test:browser` - 11 passed
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-deployment-profile.py --static-only`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `cargo fmt`
- `git diff --check`

## Residual Risk

This slice improves the requester-visible status journey and privacy boundary. It does not perform installed MSI clean-machine validation, reboot survival, backup/restore, repair, uninstall/reinstall, or full clerk walkthrough evidence; those remain the end-stage Windows Local 1.0 gates.
