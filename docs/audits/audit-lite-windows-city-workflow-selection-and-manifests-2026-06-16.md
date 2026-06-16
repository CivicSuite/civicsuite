# Audit Lite: Windows City Workflow Selection And Manifests

Date: 2026-06-16
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-082.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-082.md passed install integrity, managed Ollama runtime readiness, staff sign-in/RBAC, guided review visibility, Records typed reference preservation, and CivicCode source/handoff persistence. It still failed the deep city-core lifecycle gate because Clerk adopted legislation stayed at zero after a confirmed adoption action, Backup Now produced a fresh backup and README without `backup-manifest.json`, and Create Support Bundle did not leave a fresh support bundle manifest.

## Fix Reviewed

- [desktop/src/main.js](../../desktop/src/main.js): changes workflow fallback selection from array position to an explicit newest-record helper using persisted timestamps plus id sequence tie-breaks, so newly created meetings/requests/sources remain the active targets even when backend state inserts records at the front.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): records skipped backup/support files as manifest evidence instead of aborting manifest creation on unreadable entries or symbolic links.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): makes support bundle log, health, and runtime-state collection best-effort with `collection-notes.txt`, so a locked log or transient runtime-state read no longer prevents `support-manifest.json` from being written.
- [desktop/tests/static-smoke.mjs](../../desktop/tests/static-smoke.mjs): pins the frontend newest-record selection contract.

## Evidence

- `npm --prefix desktop test`
- `cargo fmt --check`
- `cargo test backup -- --test-threads=1`
- `cargo test support_bundle -- --test-threads=1`
- `cargo test meeting_workflow_persists_agenda_notice_minutes_votes_comments_actions_and_archive -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/workflow-pages.spec.mjs desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-083 should specifically require persisted Clerk adopted legislation/publication evidence, fresh `backup-manifest.json`, fresh `support-manifest.json`, and the restore lifecycle that directive 082 could not complete.
