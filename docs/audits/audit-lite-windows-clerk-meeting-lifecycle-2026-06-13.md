# Audit Lite - Windows Clerk Meeting Lifecycle

Date: 2026-06-13
Scope: CivicClerk meeting lifecycle slice for Windows Local 1.0 desktop shell.

## Findings

No unresolved findings.

## Resolved During Audit

- Medium - Archived meetings could be downgraded by later staff actions. The first implementation allowed a finalized public meeting archive to receive later vote/minutes/action changes, which would reset the status away from `archived public record`. Fixed with an archive guard on mutable clerk actions and a regression assertion that archived meetings reject later mutation while still allowing re-export without status downgrade. Evidence: `desktop/src-tauri/src/workflows.rs:300`, `desktop/src-tauri/src/workflows.rs:369`, `desktop/src-tauri/src/workflows.rs:399`, `desktop/src-tauri/src/workflows.rs:421`, `desktop/src-tauri/src/workflows.rs:440`, `desktop/src-tauri/src/workflows.rs:456`, `desktop/src-tauri/src/workflows.rs:471`, `desktop/src-tauri/src/workflows.rs:489`, `desktop/src-tauri/src/workflows.rs:503`, `desktop/src-tauri/src/workflows.rs:997`.

## Coverage

- Durable meeting contract now includes resident comments, action items, minutes adoption timestamp, archive timestamp, and backward-compatible serde defaults. Evidence: `desktop/src-tauri/src/workflows.rs:18`.
- Staff UI exposes action item, resident comment, minutes adoption, and public archive controls with Tauri payloads. Evidence: `desktop/src/main.js:386`, `desktop/src/main.js:387`, `desktop/src/main.js:928`, `desktop/src/main.js:929`, `desktop/src/main.js:933`, `desktop/src/main.js:934`, `desktop/src/main.js:935`, `desktop/src/main.js:936`, `desktop/src/main.js:1572`, `desktop/src/main.js:1573`.
- Public meeting surface and local search now include archived public records and full meeting record text. Evidence: `desktop/src/main.js:869`, `desktop/src/main.js:1115`, `desktop/src/main.js:1116`, `desktop/src/main.js:1117`.
- Browser workflow smoke verifies new staff controls and confirms public surface hides the archive control. Evidence: `desktop/tests/browser/workflow-pages.spec.mjs:12`, `desktop/tests/browser/workflow-pages.spec.mjs:15`, `desktop/tests/browser/workflow-pages.spec.mjs:47`.

## Verification

- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --nocapture`: pass.
- `cargo test`: pass, 60 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 9 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- This slice does not complete the remaining Records review/approval lifecycle or CivicCode codifier sync state. Those remain separate city-core workflow slices.
