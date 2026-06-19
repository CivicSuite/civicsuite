# Audit Lite - Windows Selected Workflow Records

Date: 2026-06-13
Scope: Explicit selected-record targeting for CivicClerk meetings, CivicRecords AI requests, CivicCode sources, and CivicCode-to-Clerk handoffs in the Windows Local 1.0 desktop shell.

## Findings

No unresolved findings.

## Coverage

- Backend workflow actions now accept optional selected IDs for meetings, records requests, code sources, and code handoffs while preserving the existing current-record fallback when no ID is supplied. Evidence: `desktop/src-tauri/src/workflows.rs:401`, `desktop/src-tauri/src/workflows.rs:434`, `desktop/src-tauri/src/workflows.rs:485`, `desktop/src-tauri/src/workflows.rs:1167`.
- Meeting, records, code, and handoff actions now target selected records instead of always mutating the newest local record. Evidence: `desktop/src-tauri/src/workflows.rs:549`, `desktop/src-tauri/src/workflows.rs:579`, `desktop/src-tauri/src/workflows.rs:859`, `desktop/src-tauri/src/workflows.rs:1213`, `desktop/src-tauri/src/workflows.rs:1423`.
- Desktop UI now tracks selected workflow records and passes selected IDs through every relevant city workflow payload. Evidence: `desktop/src/main.js:367`, `desktop/src/main.js:903`, `desktop/src/main.js:1865`, `desktop/src/main.js:2034`.
- Staff record lists now show which meeting, records request, code source, or code handoff will receive subsequent actions, with a `Work On This` control for switching targets. Evidence: `desktop/src/main.js:1284`, `desktop/src/main.js:1396`, `desktop/src/main.js:1492`, `desktop/src/main.js:1503`.
- Regression coverage creates multiple records in each module, targets the older/non-first record by ID, and verifies only the selected record changes. Evidence: `desktop/src-tauri/src/workflows.rs:1933`.

## Verification

- `cargo test workflow_actions_target_selected_records_when_ids_are_supplied -- --nocapture`: pass.
- `cargo test`: pass, 61 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 10 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- Browser preview starts from empty local fallback state, so the visual `Work On This` buttons are covered by static smoke and source inspection while selected-ID mutation behavior is covered by Rust workflow tests. A future seeded browser fixture would add direct click coverage for non-empty record lists.
