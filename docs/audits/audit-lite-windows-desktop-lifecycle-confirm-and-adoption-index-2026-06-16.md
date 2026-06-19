# Audit Lite: Windows Desktop Lifecycle Confirm And Adoption Index

Date: 2026-06-16
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-084.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-084.md proved the tester was using the installed Tauri desktop app surface rather than the stale suite launcher. The deep city-core retest still failed because `Backup Now` and `Create Support Bundle` opened their guided review panels but their confirm buttons left the panel open and did not create fresh manifests. The same run also showed nested Clerk adoption workflow evidence while the top-level `adopted_legislation` count remained zero.

## Fix Reviewed

- [desktop/src/main.js](../../desktop/src/main.js): normalizes missing supervisor service ids to explicit `null` before invoking the Tauri command, so whole-profile lifecycle actions like backup and support bundle do not rely on an omitted argument.
- [desktop/src/main.js](../../desktop/src/main.js): clears the guided lifecycle review panel and shows a working status before long-running native lifecycle actions, making confirm-button progress visible and preventing a stale review panel from masking command dispatch.
- [desktop/src-tauri/src/workflows.rs](../../desktop/src-tauri/src/workflows.rs): normalizes the top-level adopted-legislation index from meeting-nested adoption records when workflow state is read, preserving durable adoption evidence across older or partially indexed local state.
- [desktop/tests/static-smoke.mjs](../../desktop/tests/static-smoke.mjs): pins the nullable service-id and lifecycle working-state frontend contract.

## Evidence

- `npm --prefix desktop test`
- `cargo fmt --check`
- `cargo test city_work_state_backfills_adopted_legislation_index_from_meetings -- --test-threads=1`
- `cargo test backup -- --test-threads=1`
- `cargo test support_bundle -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-085 should specifically require desktop-only confirmation that `Confirm Backup Now` creates a fresh `backup-manifest.json`, `Confirm Create Support Bundle` creates a fresh `support-manifest.json`, the top-level adopted legislation count advances/persists, and the restore lifecycle can continue from the fresh backup.
