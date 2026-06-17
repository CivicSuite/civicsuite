# Audit Lite: Windows Backup Manifest And Adoption Index Persistence

Date: 2026-06-16
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-085.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-085.md confirmed that the installed Tauri desktop app surface was used and that lifecycle confirm buttons now leave guided review state. The retest still failed because a fresh `Backup Now` directory copied `Data` but did not include `backup-manifest.json` or root `README.txt`, and because nested Clerk adoption evidence persisted while the durable top-level `adopted_legislation` index remained zero in the local store.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): makes manual backups copy local data/config best-effort, records copy failures in manifest `skipped_files`, and continues to write root `README.txt` plus `backup-manifest.json` for partially copied backups.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): keeps backup verification strict for recorded file hashes while allowing manifest `skipped_files` to include source-copy failures that are not discoverable from the finished backup folder.
- [desktop/src-tauri/src/workflows.rs](../../desktop/src-tauri/src/workflows.rs): persists the normalized top-level adopted-legislation index back to `city-work.json` when legacy or partially indexed state is read from meeting-nested adoption records.
- [desktop/src-tauri/src/workflows.rs](../../desktop/src-tauri/src/workflows.rs): extends the adopted-legislation regression test to verify the normalized top-level index is written back to disk, not only returned in memory.

## Evidence

- `cargo fmt --check`
- `cargo test backup -- --test-threads=1`
- `cargo test city_work_state_backfills_adopted_legislation_index_from_meetings -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-086 should specifically require desktop-only confirmation that `Backup Now` always leaves a root `README.txt` and `backup-manifest.json` even when files are skipped, the manifest records any `skipped_files`, the top-level adopted legislation count is nonzero in the persisted local store after close/reopen, and restore can continue from the fresh product-created backup.
