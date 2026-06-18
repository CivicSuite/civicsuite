# Audit Lite: Windows Restore Deferred Old Folder Cleanup

Date: 2026-06-18
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-091.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-091.md proved elevated install, uninstall, reinstall, backup manifest/README creation, adopted-legislation persistence, Records/Code durability, support bundle creation, repair, and post-restore data visibility. The remaining product failure was that Restore Latest Backup still stayed in the desktop `Working` state and local data store, city workflow services, task queue schema, and background work queue health remained degraded after product Stop, retry, Start, Check, and Repair controls.

The result showed restored Clerk, Records, Resident, and Code evidence was already visible while the restore action was still open. That pointed to the post-swap old-folder cleanup path, not the Data/config restore itself.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): after verified Data/config staging and swap, restore now reports old-folder cleanup as pending instead of synchronously deleting the previous Data/config trees before returning to the desktop UI.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): preserves the `Restore needs service start` result after runtime-state PIDs are cleared, so product Start/Check/Repair controls own post-restore service recovery.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): updates restore regression coverage to prove staging folders are not left behind, previous profile folders are retained as pending old-folder cleanup, and the bounded restore result includes the cleanup note.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. The next directive should require installed desktop app confirmation that Restore Latest Backup returns `Restore needs service start` or `Restore complete` instead of remaining stuck on Working, records the old-folder cleanup pending note, then verifies Start/Check/Repair controls recover local data store, city workflow services, task queue schema, and background work queue health without hand-killing processes or editing the profile.
