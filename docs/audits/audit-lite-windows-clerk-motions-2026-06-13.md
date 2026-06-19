# Audit Lite: Windows Clerk Motions

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: CivicClerk first-class meeting motion records for the Windows Local desktop app.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings remain for this slice.

## Evidence Reviewed

- Backend data/action path: durable `MotionRecord`, meeting `motions`, `record-motion` validation, audit entry, CivicClerk action gate, export formatter, search text, and public projection behavior in `desktop/src-tauri/src/workflows.rs:140`, `desktop/src-tauri/src/workflows.rs:175`, `desktop/src-tauri/src/workflows.rs:1845`, `desktop/src-tauri/src/workflows.rs:2100`, `desktop/src-tauri/src/workflows.rs:4340`, `desktop/src-tauri/src/workflows.rs:4915`, `desktop/src-tauri/src/workflows.rs:4979`, and `desktop/src-tauri/src/main.rs:147`.
- Desktop UI path: motion draft fields, capture controls, pre-archive public filtering, local search inclusion, and Tauri payload wiring in `desktop/src/main.js:576`, `desktop/src/main.js:2076`, `desktop/src/main.js:2268`, `desktop/src/main.js:3020`, and `desktop/src/main.js:4269`.
- Browser/public-surface coverage: staff motion controls visible and Resident/Public motion action hidden in `desktop/tests/browser/workflow-pages.spec.mjs:53` and `desktop/tests/browser/workflow-pages.spec.mjs:175`.
- Operator walkthrough updated to include recording a motion before vote/action/minutes adoption in `docs/installer/operator-walkthrough.md:78`.

## Verification

- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1` passed.
- `npm run test:browser` passed.
- `npm test -- --runInBand` passed.
- `cargo test -- --test-threads=1` passed: 96 tests.
- `cargo check` passed.
- `npm run build` passed.
- `python scripts\verify-module-manifest-contract.py` passed.
- `python scripts\verify-installer-plan.py` passed.
- `python scripts\verify-deployment-profile.py --static-only` passed.
- `bash scripts/verify-docs.sh` passed.
- `git diff --check` passed.

## Residual Risk

This proves the durable workflow, export/search behavior, and browser-preview controls. It does not replace the later clean-machine installed-app walkthrough for real Tauri mutation evidence, install, reboot survival, backup/restore, repair, uninstall, or reinstall.
