# Audit Lite: Windows Restore Latest Skips Pre-Restore Safety Backups

Date: 2026-06-19
Branch: `work/windows-local-1-design-contract`
Scope: PR #192 Windows Local restore-after-reinstall failure from `TESTER-RESULT-097.md`.

## Finding

`TESTER-RESULT-097.md` confirmed the zlib runtime dependency fix and the Windows Installer lifecycle fix, but Restore Latest Backup restored product state without the fresh directive-097 Clerk/Records/Code marker.

The restore selector was ordering backup folders by folder name. Internal pre-restore safety backup folders use the `civicsuite-pre-restore-backup-*` prefix, which sorts after `civicsuite-manual-backup-*` regardless of timestamp. On a reused bare-metal tester backup folder, an older pre-restore safety backup could therefore be selected instead of the fresh manual backup created by Backup Now.

## Fix

Restore Latest Backup now reads each candidate backup manifest and selects by `created_unix_seconds`, while excluding internal `pre-restore` safety backups from user-facing restore selection.

## Regression

Added `restore_latest_ignores_stale_pre_restore_safety_backup`, which creates:

- an older `pre-restore` safety backup containing stale data;
- a fresher manual backup containing fresh data;
- current mutated profile data.

The test proves Restore Latest Backup chooses the fresh manual backup even though the stale pre-restore folder name sorts later lexicographically.

## Verification

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF warnings only
