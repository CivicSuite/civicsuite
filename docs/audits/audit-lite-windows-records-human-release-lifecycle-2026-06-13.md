# Audit Lite - Windows Records Human Release Lifecycle

Date: 2026-06-13
Scope: CivicRecords AI request lifecycle slice for Windows Local 1.0 desktop shell.

## Findings

No unresolved findings.

## Resolved During Audit

- High - Export was previously equivalent to public release. The existing local desktop path marked a records response `exported`, and the public surface treated `exported` as released. That contradicted the CivicRecords spec requirement that there be no auto-redaction, auto-denial, or auto-release. Fixed by separating file export from public release: staff must approve, export, mark fulfilled, then close. Public visibility now requires fulfilled/closed status or a fulfillment timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:808`, `desktop/src-tauri/src/workflows.rs:835`, `desktop/src-tauri/src/workflows.rs:892`, `desktop/src-tauri/src/workflows.rs:912`, `desktop/src/main.js:973`.

## Coverage

- Durable request state now tracks assignment, clarification notes, search notes, exemption review, fee estimate, approval notes, approval timestamp, fulfillment timestamp, and close timestamp with serde defaults for existing local profiles. Evidence: `desktop/src-tauri/src/workflows.rs:43`.
- The backend records lifecycle now supports clarification, assignment, search evidence, exemption review, fee estimate, draft, human approval, export, fulfillment, and closure through the same `city_work_action` command path used by the desktop UI. Evidence: `desktop/src-tauri/src/workflows.rs:692`, `desktop/src-tauri/src/workflows.rs:710`, `desktop/src-tauri/src/workflows.rs:728`, `desktop/src-tauri/src/workflows.rs:750`, `desktop/src-tauri/src/workflows.rs:768`, `desktop/src-tauri/src/workflows.rs:808`, `desktop/src-tauri/src/workflows.rs:835`, `desktop/src-tauri/src/workflows.rs:892`, `desktop/src-tauri/src/workflows.rs:912`.
- Active request guard prevents changes after fulfillment/closure, preserving public-release integrity. Evidence: `desktop/src-tauri/src/workflows.rs:337`.
- Staff UI exposes records scope/search/review/release controls and payloads. Evidence: `desktop/src/main.js:1024`, `desktop/src/main.js:1032`, `desktop/src/main.js:1033`, `desktop/src/main.js:1034`, `desktop/src/main.js:1035`, `desktop/src/main.js:1036`, `desktop/src/main.js:1040`, `desktop/src/main.js:1045`, `desktop/src/main.js:1047`, `desktop/src/main.js:1048`, `desktop/src/main.js:1627`, `desktop/src/main.js:1628`, `desktop/src/main.js:1629`, `desktop/src/main.js:1633`, `desktop/src/main.js:1634`, `desktop/src/main.js:1639`, `desktop/src/main.js:1640`, `desktop/src/main.js:1641`.
- Regression test covers failed pre-approval export, approval, export, fulfillment, closure, exported review sections, and records search over exemption text. Evidence: `desktop/src-tauri/src/workflows.rs:1315`.

## Verification

- `cargo test records_workflow_requires_human_approval_before_release -- --nocapture`: pass.
- `cargo test`: pass, 60 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 9 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- This slice implements local lifecycle and release gates, not real connector ingestion, SMTP sending, or a public request portal. Those remain separate Windows Local 1.0 hardening slices.
