# Audit Lite - Windows Public Comment Review And Redaction

Date: 2026-06-13

Scope: CivicClerk public-comment review and redaction in the Windows-local desktop shell, including backend status transitions, statutory-basis audit logging, packet/export behavior, public-search leakage controls, and Staff/Resident UI boundaries.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence

- Public comment records now carry redacted text, redaction basis, reviewed timestamp, and redacted timestamp with serde defaults. Evidence: `desktop/src-tauri/src/workflows.rs:30`.
- `review-public-comment` and `redact-public-comment` are backend workflow actions with audit entries; redaction requires both redacted text and statutory basis. Evidence: `desktop/src-tauri/src/workflows.rs:808`, `desktop/src-tauri/src/workflows.rs:831`, `desktop/src-tauri/src/workflows.rs:1883`.
- Meeting packet exports use redacted text and include the redaction basis instead of exposing the original public comment body. Evidence: `desktop/src-tauri/src/workflows.rs:914`.
- The focused regression verifies pre-posting rejection, intake, review, redaction, export redaction, staff search access to original text, and audit-chain entries. Evidence: `desktop/src-tauri/src/workflows.rs:2100`.
- Staff UI exposes Public Comment Review with disabled actions until a comment is selected, plus guided review for review/redaction actions. Evidence: `desktop/src/main.js:1044`, `desktop/src/main.js:1373`, `desktop/tests/browser/workflow-pages.spec.mjs:16`.
- Resident/Public UI does not show the Staff review/redaction panel, and public meeting counts only include reviewed/redacted comments. Evidence: `desktop/src/main.js:1274`, `desktop/src/main.js:1323`, `desktop/tests/browser/workflow-pages.spec.mjs:69`.

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

- Browser preview does not persist Tauri workflow mutations, so end-to-end comment review/redaction save behavior still needs full desktop walkthrough coverage in the MSI clean-machine gate.
