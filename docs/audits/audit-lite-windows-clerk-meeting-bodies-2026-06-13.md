# Audit Lite: Windows Clerk Meeting Bodies

Date: 2026-06-13

Scope:
- `desktop/src-tauri/src/workflows.rs`
- `desktop/src-tauri/src/main.rs`
- `desktop/src/main.js`
- `desktop/tests/browser/workflow-pages.spec.mjs`
- `docs/installer/operator-walkthrough.md`

Findings:
- None unresolved.

Resolved during audit:
- Backend meeting creation initially still accepted a typed body name that did not correspond to a saved meeting body, which would have let a clerk bypass statutory-basis, cadence, notice-days, and quorum setup. Fixed by requiring a saved meeting body for new meetings in `desktop/src-tauri/src/workflows.rs:892`, adding the failure regression at `desktop/src-tauri/src/workflows.rs:4808`, and disabling the UI create action until a body exists at `desktop/src/main.js:2130`.

Evidence reviewed:
- `MeetingBody` durable state and public projection are added in `desktop/src-tauri/src/workflows.rs:11`.
- `create-meeting-body` validates name/statutory basis, duplicate names, default notice days, cadence, and quorum before persistence in `desktop/src-tauri/src/workflows.rs:1031`.
- `create-meeting-body` is gated to CivicClerk in `desktop/src-tauri/src/main.rs:136`.
- Staff UI now has guided setup review and saved-body selection in `desktop/src/main.js:1338`, `desktop/src/main.js:1448`, and `desktop/src/main.js:2110`.
- Browser checks cover visible controls, disabled pre-body meeting creation, public-surface hiding, guided review, and browser-preview mutation refusal in `desktop/tests/browser/workflow-pages.spec.mjs`.

Verification:
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`: passed.
- `npm test -- --runInBand`: passed.
- `npm run test:browser`: passed, 11 passed.
- `cargo check`: passed.
- `npm run build`: passed.
- `python scripts\verify-module-manifest-contract.py`: passed.
- `python scripts\verify-deployment-profile.py --static-only`: passed.
- `python scripts\verify-installer-plan.py`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed.
- `cargo test -- --test-threads=1`: passed, 95 passed.

Residual risk:
- This slice does not add body edit/deactivate history. The current release path supports creation and durable linkage for the 1.0 meeting workflow; lifecycle management for body changes should be a later Clerk administration slice if required by jurisdiction onboarding.
