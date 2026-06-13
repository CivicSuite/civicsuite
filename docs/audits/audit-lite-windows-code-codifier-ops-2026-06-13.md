# Audit Lite - Windows Code Codifier Operations

Date: 2026-06-13
Scope: CivicCode codifier sync, stale-code tracking, guidance approval, and public disclaimer slice for Windows Local 1.0 desktop shell.

## Findings

No unresolved findings.

## Coverage

- Durable CivicCode state now tracks codifier name, authoritative URL, version label, sync status, sync errors, last sync timestamp, stale timestamp, amendment notes, staff guidance, plain-language summary, and human guidance approval timestamp. Evidence: `desktop/src-tauri/src/workflows.rs:77`.
- Backend actions now support codifier sync success/failure/retry, stale-code amendment tracking, staff guidance draft, human guidance approval, citation-preserving public export, source publish/unpublish, and clerk handoff. Evidence: `desktop/src-tauri/src/workflows.rs:1006`, `desktop/src-tauri/src/workflows.rs:1031`, `desktop/src-tauri/src/workflows.rs:1049`, `desktop/src-tauri/src/workflows.rs:1065`, `desktop/src-tauri/src/workflows.rs:1081`, `desktop/src-tauri/src/workflows.rs:1103`, `desktop/src-tauri/src/workflows.rs:1121`.
- Staff UI exposes codifier sync, retry, stale marker, guidance draft, and approval controls with payloads. Evidence: `desktop/src/main.js:1122`, `desktop/src/main.js:1129`, `desktop/src/main.js:1130`, `desktop/src/main.js:1131`, `desktop/src/main.js:1132`, `desktop/src/main.js:1136`, `desktop/src/main.js:1140`, `desktop/src/main.js:1141`, `desktop/src/main.js:1697`, `desktop/src/main.js:1702`, `desktop/src/main.js:1703`, `desktop/src/main.js:1704`, `desktop/src/main.js:1705`, `desktop/src/main.js:1709`.
- Public code output includes approved non-authoritative summaries only after human approval and carries staff-contact/legal-interpretation disclaimer language. Evidence: `desktop/src-tauri/src/workflows.rs:1121`.
- Regression test covers sync failure, retry, successful sync, stale marking, guidance approval, public export contents, handoff creation, and search over guidance text. Evidence: `desktop/src-tauri/src/workflows.rs:1602`.

## Verification

- `cargo test code_workflow_persists_source_handoff_and_search -- --nocapture`: pass.
- `cargo test`: pass, 60 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 9 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- This slice records codifier sync state and retry intent locally. It does not implement a live Municode/American Legal/General Code connector or historical section-version diff engine; those remain deeper CivicCode hardening tasks.
