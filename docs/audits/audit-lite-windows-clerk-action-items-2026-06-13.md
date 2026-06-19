# Audit Lite: Windows Clerk Action Item Tracker

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: CivicClerk durable action item tracker for Windows Local 1.0

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend adds durable action records with description, owner, due date, status, source reference, creation timestamp, and backwards-compatible `action_items` preservation in `desktop/src-tauri/src/workflows.rs:153`, `desktop/src-tauri/src/workflows.rs:195`, and `desktop/src-tauri/src/workflows.rs:1917`.
- Minutes draft and packet export include detailed action records so the clerk-facing record is not reduced to plain text in `desktop/src-tauri/src/workflows.rs:2174` and `desktop/src-tauri/src/workflows.rs:2513`.
- City search indexes action record owner, due date, status, and source reference in `desktop/src-tauri/src/workflows.rs:4509`.
- Pre-archive public projection keeps staff action details out of public notice views while archived public records retain official action details in `desktop/src-tauri/src/workflows.rs:4903`.
- Regression coverage verifies invalid due dates, persisted action record fields, archive content, search by owner/source, public archive projection, and post-archive mutation blocking in `desktop/src-tauri/src/workflows.rs:5277`.
- Desktop UI exposes owner, due date, status, and source fields, renders action details, includes them in local search, and sends the complete payload in `desktop/src/main.js:583`, `desktop/src/main.js:2284`, `desktop/src/main.js:2348`, `desktop/src/main.js:3039`, and `desktop/src/main.js:4306`.
- Browser workflow coverage verifies the action-item fields are visible in `desktop/tests/browser/workflow-pages.spec.mjs:59`.
- Operator walkthrough now names owner/due/status/source action-item evidence in `docs/installer/operator-walkthrough.md:75`.

## Verification

- `cargo fmt` passed.
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` passed.
- `npm run test:browser` passed.
- `npm test -- --runInBand` passed.
- `cargo test -- --test-threads=1` passed: 96 tests.
- `npm run build` passed.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\verify-deployment-profile.py --static-only` passed.
- `bash scripts/verify-docs.sh` passed.
- `cargo check` passed.
- `python scripts\verify-installer-plan.py` passed.
- `git diff --check` passed with only existing CRLF normalization warnings.

## Residual Risk

This slice verifies the local workflow and browser surface, but it does not replace the later clean-machine Windows installed-app walkthrough for Tauri mutation, install, reboot persistence, backup/restore, repair, uninstall, and reinstall.
