# Audit Lite: Windows Public Records Status Lookup

Date: 2026-06-13

Scope: Resident/Public records status lookup in the Windows-local desktop shell, including public-safe backend projection, unauthenticated Tauri command access, UI wiring, and browser workflow coverage.

## Findings

No open findings.

## Fixed During Audit

- Low - A no-match lookup initially returned `accepted: true`, which would have rendered as a saved/success state in the desktop action-result panel. Fixed by returning `accepted: false` for the no-match result while preserving the public-safe state projection. Evidence: `desktop/src-tauri/src/workflows.rs:2048`, `desktop/src-tauri/src/workflows.rs:2051`.

## Evidence Reviewed

- `desktop/src-tauri/src/workflows.rs`: public records projection now clears requester contact and staff-only workflow fields before returning public status data; lookup requires both request number and submitted contact.
- `desktop/src-tauri/src/main.rs`: unauthenticated public actions may call the lookup action without local-admin session, while staff-only actions remain admin-gated.
- `desktop/src/main.js`: Resident/Public records screen now asks for request number plus submitted contact and only renders pending intake after a verified lookup.
- `desktop/tests/browser/workflow-pages.spec.mjs`: browser walkthrough asserts the status lookup controls and updated public-safety copy.

## Verification

- `cargo test` from `desktop/src-tauri` passed: 72 passed.
- `npm run test:browser` from `desktop` passed: 10 passed.
- `npm test` from `desktop` passed: desktop static smoke checks.
- `git diff --check` passed before the audit fix; rerun is required after adding this audit record.

## Residual Risk

- This slice is validated with Rust unit tests and browser-preview walkthrough coverage. Installed Tauri bridge behavior still needs the planned MSI cleanroom walkthrough after the current Windows MSI artifact is available.
