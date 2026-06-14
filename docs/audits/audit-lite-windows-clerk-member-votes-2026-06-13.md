# Audit Lite: Windows Clerk Member Roster And Roll-Call Votes

Date: 2026-06-13
Scope: Clerk member roster persistence, structured roll-call vote records, desktop controls, public archive/search/export wiring, docs, and tests.

## Findings

No Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence Reviewed

- Backend state and actions: `MeetingMember`, `MemberVoteRecord`, `add-meeting-member`, and `record-member-vote` are durable local workflow records with duplicate and validity checks in `desktop/src-tauri/src/workflows.rs:24`, `desktop/src-tauri/src/workflows.rs:187`, `desktop/src-tauri/src/workflows.rs:1301`, and `desktop/src-tauri/src/workflows.rs:2216`.
- Desktop module gate: both new actions are owned by CivicClerk in `desktop/src-tauri/src/main.rs:137` and `desktop/src-tauri/src/main.rs:153`.
- Export/archive/search wiring: roll-call votes are included in packet/archive output and public projection after archive in `desktop/src-tauri/src/workflows.rs:2810`, `desktop/src-tauri/src/workflows.rs:3290`, and `desktop/src-tauri/src/workflows.rs:5884`.
- UI wiring: the desktop workflow exposes Member Roster controls, guided review, roll-call motion/member/vote controls, and action payloads in `desktop/src/main.js:1552`, `desktop/src/main.js:1795`, `desktop/src/main.js:2381`, `desktop/src/main.js:2527`, `desktop/src/main.js:4545`, and `desktop/src/main.js:4643`.
- Browser smoke coverage: roster and roll-call controls are asserted in `desktop/tests/browser/workflow-pages.spec.mjs:15` and `desktop/tests/browser/workflow-pages.spec.mjs:85`.
- Operator docs: the walkthrough includes roster setup and roll-call voting in `docs/installer/operator-walkthrough.md:78`.

## Verification

- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: 96 passed.
- `cargo check`: passed.
- `cargo fmt -- --check`: passed.
- `npm test -- --runInBand`: passed.
- `npm run build`: passed.
- `npm run test:browser`: 11 passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `git diff --check`: passed with line-ending warnings only.

## Residual Risk

No release-blocking residual risk for this slice. Full clean-machine install/reboot/uninstall evidence remains an end-stage gate, not a blocker for this scoped Clerk workflow change.
