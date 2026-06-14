# Audit Lite: Windows Clerk Packet Attachments

Date: 2026-06-13
Scope: CivicClerk packet attachment workflow in the Windows Local desktop path.

## Findings

No findings.

## Evidence Reviewed

- Data contract: `MeetingAttachment` and backward-compatible `Meeting.attachments` default in `desktop/src-tauri/src/workflows.rs:69` and `desktop/src-tauri/src/workflows.rs:97`.
- Mutation path: `add_meeting_attachment` copies an existing local file into `Data/files/meetings`, records citation/access/section, SHA-256, size, and audit evidence in `desktop/src-tauri/src/workflows.rs:1023`.
- Public safety path: archive/re-export renders from `public_meeting_projection`, which filters closed-session addenda and clears local paths in `desktop/src-tauri/src/workflows.rs:1955`, `desktop/src-tauri/src/workflows.rs:1982`, and `desktop/src-tauri/src/workflows.rs:4116`.
- UI path: Staff workflow exposes Packet Attachments controls and guided review in `desktop/src/main.js:1444` and `desktop/src/main.js:2071`; Resident/Public controls remain hidden in browser coverage at `desktop/tests/browser/workflow-pages.spec.mjs:116`.
- Test path: Clerk persistence/archive test covers public and closed-session attachments, hash evidence, search, public projection scrubbing, archive export, and archived re-export in `desktop/src-tauri/src/workflows.rs:4491`.

## Verification

- `cargo fmt`
- `npm test -- --runInBand`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`
- `npm run test:browser`
- `cargo check`
- `cargo test -- --test-threads=1`
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `python scripts\verify-deployment-profile.py --static-only`
- `git diff --check`

## Residual Risk

Clean-machine installer evidence is still deferred to the later full Windows Local 1.0 clean install/reboot/uninstall gate. This slice is covered by local unit, browser, build, docs, installer-plan, and deployment-profile checks.
