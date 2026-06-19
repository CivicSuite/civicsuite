# Audit Lite: Windows Records Notification Outbox

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: CivicRecords AI local notification outbox and sent-log evidence

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added durable `NotificationEvent` state, local notification creation for Records intake/deadline/clarification/fulfillment/closure, staff-only search coverage, public projection exclusion, and `mark-notification-sent` audit evidence.
- `desktop/src-tauri/src/main.rs`: added CivicRecords AI module gating for `mark-notification-sent` and public/staff boundary assertions for notification visibility.
- `desktop/src/main.js`: added staff Records Notification Outbox UI, guided review for logging notifications sent, notification selection/payload wiring, staff-only local search coverage, and fallback state support.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs`: added browser/static coverage for the Records Notification Outbox and public-surface exclusion.
- `docs/installer/operator-walkthrough.md`: added the Notification Outbox and sent-log step to the clerk smoke path.

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
- `python scripts\verify-deployment-profile.py --static-only`
- `git diff --check`

## Non-Slice Gate Notes

- `python scripts\verify-suite-state.py` still fails because the local workspace does not contain future-module sibling repos such as `civiczone`, `civicaccess`, and later catalog modules. The city-core source pins passed.
- `python scripts\verify-deployment-profile.py` full mode still fails because that legacy post-foundation demo profile imports `civiczone`; static-only mode passed.
- `python scripts\verify-release-lockstep.py` is not applicable on this feature branch; it expects main-branch umbrella truth artifacts.
- `python scripts\verify-secret-scan.py` was attempted twice and timed out, including one five-minute run.

## Residual Risk

This slice implements a durable local notification outbox and staff sent-log evidence. It does not add automatic SMTP or external mail delivery; that remains a configurable connector concern outside the local-only Windows default path.
