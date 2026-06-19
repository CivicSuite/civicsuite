# Audit Lite: Windows CivicCode Source History And Public Boundary

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: CivicCode local source/version history, public export boundary, and public-surface search guards.

## Findings

None.

Severity counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

## Evidence Reviewed

- `desktop/src-tauri/src/workflows.rs:108` adds durable `CodeVersionEntry` records and `desktop/src-tauri/src/workflows.rs:142` persists them on each `CodeSource`.
- `desktop/src-tauri/src/workflows.rs:1528`, `desktop/src-tauri/src/workflows.rs:1579`, `desktop/src-tauri/src/workflows.rs:1646`, and `desktop/src-tauri/src/workflows.rs:1718` append version history for local import, codifier sync, and stale-code transitions.
- `desktop/src-tauri/src/workflows.rs:1812` publishes public code exports with `Public Update Status`, `Version / Codifier History`, and an explicit staff-boundary section instead of internal staff guidance, sync errors, or amendment notes.
- `desktop/src-tauri/src/workflows.rs:2236` clears staff-only code fields and version-history notes from public code projection.
- `desktop/src-tauri/src/workflows.rs:2905` verifies public code questions use published current citations, and `desktop/src-tauri/src/workflows.rs:2942` verifies public questions do not match staff-only guidance.
- `desktop/src-tauri/src/workflows.rs:2790` verifies source history is durable, searchable for staff, and included in the public export without leaking internal amendment notes.
- `desktop/src/main.js:1521`, `desktop/src/main.js:1725`, and `desktop/src/main.js:1744` add browser-side public projections for meetings, records, and code so a signed-in clerk previewing the Resident/Public surface still sees sanitized public data.
- `desktop/src/main.js:1781` and `desktop/src/main.js:1792` split public and staff search fields for code questions and cross-module search.
- `desktop/tests/static-smoke.mjs:57` guards the public/staff boundary helpers and `desktop/tests/static-smoke.mjs:44` guards visible source-history copy.

## Verification

- `cargo fmt --check` passed in `desktop/src-tauri`.
- `cargo test` passed in `desktop/src-tauri`: 81 passed, 0 failed.
- `npm test` passed in `desktop`: static smoke checks passed.
- `npm run test:browser -- workflow-pages.spec.mjs` passed in `desktop`: 6 passed.

## Residual Risk

This slice does not add a live external codifier connector or clean-machine install evidence. It completes the local durable source-history path and tightens the public/staff display and search boundary that the Windows Local 1.0 desktop shell already owns.
