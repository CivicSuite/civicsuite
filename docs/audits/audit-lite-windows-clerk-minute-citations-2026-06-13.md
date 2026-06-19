# Audit Lite: Windows Clerk Minute Citations

Date: 2026-06-13
Scope: CivicClerk minute citation workflow in the Windows Local desktop path.

## Findings

No findings.

## Evidence Reviewed

- Data contract: `MinuteCitation` and backward-compatible `Meeting.minute_citations` default in `desktop/src-tauri/src/workflows.rs:84` and `desktop/src-tauri/src/workflows.rs:111`.
- Mutation path: `add_minute_citation` requires a saved/current minutes draft, requires the cited sentence/excerpt to appear in that draft, records source type/reference/note/access, and writes audit evidence in `desktop/src-tauri/src/workflows.rs:1312`.
- Adoption guard: `adopt_minutes` now blocks adopted-minute status until citation evidence exists in `desktop/src-tauri/src/workflows.rs:1651`.
- Public safety path: packet/archive rendering includes minute citations, while public projection filters staff-only citations before archive publication in `desktop/src-tauri/src/workflows.rs:1943`, `desktop/src-tauri/src/workflows.rs:2028`, and `desktop/src-tauri/src/workflows.rs:4235`.
- UI path: Staff workflow exposes Minute Citations controls and guided review in `desktop/src/main.js:1538` and `desktop/src/main.js:2133`; Resident/Public controls remain hidden in browser coverage at `desktop/tests/browser/workflow-pages.spec.mjs:123`.
- Test path: Clerk persistence/archive test covers citation-required adoption, public/staff-only citation storage, search, packet export, public archive filtering, public projection, and archived re-export in `desktop/src-tauri/src/workflows.rs:4618`.

## Verification

- `cargo fmt`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`
- `npm test -- --runInBand`
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

This slice enforces at least one citation for the current minutes draft, but it does not yet prove every sentence has a citation or add transcript-segment ingestion. Those remain broader CivicClerk completion work for later slices and the full walkthrough/audit gates.
