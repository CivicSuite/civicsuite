# Audit Lite: Windows Clerk Notice Checklist

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Slice: CivicClerk notice checklist readiness gate

## Findings

No unresolved findings.

## Scope Reviewed

- `desktop/src-tauri/src/workflows.rs`: added durable `NoticeChecklist` records, strict local date validation, timezone validation, checklist approval gating, and late-posting rejection before `post-notice` can mark a meeting notice ready.
- `desktop/src-tauri/src/workflows.rs`: meeting packets, archives, local AI minutes context, and local search now include notice checklist and posting-proof evidence.
- `desktop/src-tauri/src/main.rs`: CivicClerk module guard now covers `complete-notice-checklist`, and public-projection fixtures follow the checklist-to-posting path.
- `desktop/src/main.js`: Meetings & Notices now exposes checklist fields, an approval checkbox, guided review copy, posting-date capture, saved checklist display, and payload wiring.
- `desktop/tests/browser/workflow-pages.spec.mjs` and `desktop/tests/static-smoke.mjs`: UI/static coverage now asserts the checklist controls, guided review, and backend action contract strings.
- `docs/installer/operator-walkthrough.md`: clerk walkthrough now records the checklist before posting proof.

## Verification

- `cargo fmt`
- `cargo test -- --test-threads=1` - 95 passed
- `cargo check`
- `npm test`
- `npm run test:browser` - 11 passed
- `npm run build`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\docs\verify_docs_truth.py`
- `python scripts\policy\check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice enforces clerk-entered meeting type, statutory basis, deadline, time zone, human approval, and posting date evidence. It does not claim legal sufficiency or ship a full jurisdiction-specific statutory rule pack; future CivicNotice/CivicCore rule data can add richer municipal calendars without weakening this local evidence gate.
