# Audit Lite: Windows Restore Profile Lock Recovery

Date: 2026-06-17
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-086.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-086.md passed the installed desktop app surface, runtime/model readiness, backup manifest/README creation, Clerk adopted-legislation persistence, Records and Code typed reference durability, support bundle manifest creation, and repair checks. The remaining failure was product-controlled restore after uninstall/reinstall: `Restore Latest Backup` created the correct review and pre-restore safety backup, but failed to remove the live `Data` folder because Windows reported it was still in use.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): stops managed runtime processes by remembered PID and by bundled executable path, so stale runtime-state after reinstall cannot leave CivicSuite-managed Python, model-runtime, or PostgreSQL processes holding files in the local profile.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): waits briefly for process-backed service health to drop before replacing local data/config during restore.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): restores from a verified backup through staged replacement folders, swaps `Data` and `config` into place, retries transient Windows delete/rename failures, and treats old-folder cleanup as a post-restore note only after the replacement succeeds.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): extends restore regression coverage so restore removes post-backup files and leaves no staged/old restore folders after a normal completed restore.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore -- --test-threads=1`
- `cargo test backup -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-087 should specifically require desktop-only confirmation that restore from a fresh product-created backup completes after uninstall/reinstall, including a retry after product Stop controls if needed, while the already-passing backup manifest/README, adopted legislation, Records/Code durability, support bundle, and repair checks remain green.
