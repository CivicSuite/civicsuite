# Audit Lite - Windows Public Comment Intake

Date: 2026-06-13

Scope: CivicClerk public comment intake in the Windows-local desktop shell, including backend state, Resident/Public UI, staff visibility, packet/archive preservation, search indexing, and browser coverage.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence

- Public comments now use a durable typed record instead of overloading staff-entered comment strings, with serde defaults preserving old saved meetings. Evidence: `desktop/src-tauri/src/workflows.rs:18`, `desktop/src-tauri/src/workflows.rs:46`.
- The `submit-public-comment` action requires a posted meeting, blocks archived meetings, records written/remote/in-person mode, appends a CivicClerk audit entry, and keeps the comment available for packet/archive preservation. Evidence: `desktop/src-tauri/src/workflows.rs:713`, `desktop/src-tauri/src/workflows.rs:1778`.
- Meeting packet exports now include separate sections for staff-entered resident comments and public comments, so submitted comments are preserved in the public record path. Evidence: `desktop/src-tauri/src/workflows.rs:812`.
- Local search includes public comment name/contact/mode/topic/body for staff and public search surfaces where the meeting is otherwise public-readable. Evidence: `desktop/src-tauri/src/workflows.rs:1650`, `desktop/src/main.js:1600`.
- Resident/Public Meetings now exposes a plain public-comment intake form and a visible no-open-meeting state without showing staff meeting controls. Evidence: `desktop/src/main.js:1220`, `desktop/src/main.js:1245`, `desktop/tests/browser/workflow-pages.spec.mjs:62`.
- Staff Meetings shows a count of public comments received for clerk review. Evidence: `desktop/src/main.js:1331`.

## Verification

- `cargo test workflows::tests::public_comment_intake_requires_posted_meeting_and_is_preserved -- --nocapture`: pass.
- `cargo test -- --nocapture`: 63 passed.
- `npm test`: pass.
- `npm run test:browser`: 10 passed.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass with only expected Windows line-ending warnings.

## Residual Risk

- This slice covers intake and preservation. Public-comment redaction/review with statutory basis logging remains a follow-on CivicClerk depth slice before final 1.0 release readiness.
