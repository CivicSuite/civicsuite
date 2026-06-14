# Audit Lite: Windows Clerk-To-Code Adoption Handoff

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: CivicClerk adopted ordinance/resolution records queued into CivicCode

## Findings

No unresolved findings.

## Evidence Reviewed

- Backend adds durable adopted ordinance/resolution records on the meeting and city-work state, preserving meeting id/title, legislation type/title/text, effective date, codification hint, source motion, source agenda item, code source id, handoff status, and timestamp in `desktop/src-tauri/src/workflows.rs:167`, `desktop/src-tauri/src/workflows.rs:223`, and `desktop/src-tauri/src/workflows.rs:527`.
- `record-adopted-legislation` requires signed minutes and a passed motion, validates effective dates, updates the meeting, creates a CivicCode draft source with pending codifier sync state, and writes both Clerk and Code audit entries in `desktop/src-tauri/src/workflows.rs:2216`, `desktop/src-tauri/src/workflows.rs:2363`, and `desktop/src-tauri/src/workflows.rs:2371`.
- Packet/archive exports include an adopted ordinances/resolutions section and staff search indexes adoption records in `desktop/src-tauri/src/workflows.rs:2460`, `desktop/src-tauri/src/workflows.rs:2801`, and `desktop/src-tauri/src/workflows.rs:2844`.
- Workflow dispatch and module gating require both CivicClerk and CivicCode for the cross-module action in `desktop/src-tauri/src/workflows.rs:5407` and `desktop/src-tauri/src/main.rs:160`.
- Regression coverage proves unsigned minutes block adoption recording, signed minutes allow recording, the archive/packet contain adoption evidence, search finds the adopted title, a Code source is queued with pending codifier sync, and public archives retain the meeting adoption record in `desktop/src-tauri/src/workflows.rs:5839`.
- Desktop UI adds guided review, adopted item fields, the action button, Code-side pending adoption display, local search inclusion, and payload wiring in `desktop/src/main.js:1379`, `desktop/src/main.js:1698`, `desktop/src/main.js:2343`, `desktop/src/main.js:3076`, `desktop/src/main.js:3113`, and `desktop/src/main.js:4390`.
- Browser workflow coverage verifies the adopted item controls and action are visible in `desktop/tests/browser/workflow-pages.spec.mjs:68`.
- Operator walkthrough now includes recording adopted ordinances/resolutions for CivicCode sync before archive in `docs/installer/operator-walkthrough.md:78`.

## Verification

- `cargo fmt` passed.
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` passed.
- `npm run test:browser` initially found a misplaced adoption queue in the Records notification renderer; after moving the queue into Code workflow, `npm run test:browser` passed: 11 tests.
- `cargo test -- --test-threads=1` passed: 96 tests.
- `npm test -- --runInBand` passed.
- `npm run build` passed.
- `cargo check` passed from `desktop/src-tauri`.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\verify-deployment-profile.py --static-only` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts\verify-installer-plan.py` passed.
- `git diff --check` passed with only CRLF normalization warnings.

## Residual Risk

This slice creates a local CivicCode draft source and pending codifier sync state from a signed Clerk adoption event. It does not replace a real external codifier connector, and the full installed-app proof still belongs to the later clean-machine MSI walkthrough.
