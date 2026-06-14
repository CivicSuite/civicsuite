# Audit Lite: Windows Clerk Attendance And Quorum

Date: 2026-06-14

Scope: CivicClerk attendance and quorum slice for the Windows Local desktop path. Reviewed backend workflow contracts, Tauri action gating, staff/public UI wiring, records-ready export bundle metadata, public projection behavior, search coverage, browser controls, and operator walkthrough alignment.

## Findings

None.

## Evidence

- Backend workflow records attendance and quorum with roster validation, duplicate attendance prevention, quorum count validation, audit entries, export bundle counts, packet/archive sections, search indexing, and post-archive mutation locks in `desktop/src-tauri/src/workflows.rs`.
- Tauri module gating includes `record-meeting-attendance` and `record-quorum-check` in `desktop/src-tauri/src/main.rs`.
- Staff UI exposes attendance/quorum controls with guided review and read-back summaries, while Resident/Public hides staff controls and only sees archived attendance/quorum projections in `desktop/src/main.js`.
- Browser tests cover staff control visibility and public control hiding in `desktop/tests/browser/workflow-pages.spec.mjs`.
- Operator walkthrough now requires attendance and quorum check smoke coverage in `docs/installer/operator-walkthrough.md`.

## Verification

- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`: passed.
- `cargo test -- --test-threads=1`: passed, 96 tests.
- `cargo check`: passed.
- `cargo fmt -- --check`: passed.
- `npm test -- --runInBand`: passed.
- `npm run build`: passed.
- `npm run test:browser`: passed, 11 tests.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only expected line-ending normalization warnings.

## Residual Risk

Clean-machine install, reboot, repair, backup/restore, uninstall, and reinstall evidence remains an end-stage Windows Local gate, not part of this local Clerk slice.
