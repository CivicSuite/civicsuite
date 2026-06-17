# Audit Lite: Windows Restore Service Recovery

Date: 2026-06-17
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-088.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-088.md cleared the prior elevation blocker and proved elevated install, uninstall, reinstall, backup manifest/README creation, adopted-legislation persistence, Records/Code durability, support bundle creation, and repair. The remaining product failure was restore-after-reinstall: restored Clerk/Records/Code evidence became visible, but System Health stayed on `Working - Running Restore Latest Backup from the desktop app`, and workflow services plus task queue health did not recover after product Start, Check, and Repair controls.

## Fix Reviewed

- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): bounds native service command waits so a stuck `pg_ctl` helper cannot leave the desktop UI in Working forever.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): suppresses noisy stale-PID taskkill output while still attempting cleanup by remembered process id and executable path.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): rewrites restored `runtime-state.json` after config restore so backup-era PIDs and action metadata cannot survive uninstall/reinstall restore.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): restarts local services after a successful restore when bundled runtime binaries are present, waits for required health checks, and returns explicit service-start or service-health guidance instead of leaving the review panel in progress.
- [desktop/src-tauri/src/supervisor.rs](../../desktop/src-tauri/src/supervisor.rs): extends restore regression coverage to prove backup-restored runtime state is normalized to restore action state with no stale PIDs.

## Evidence

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test support_bundle --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-089 should require installed desktop app confirmation that Restore Latest Backup returns a completed product result after uninstall/reinstall, that workflow services and task queue health recover from product controls without hand-killing processes or editing the profile, and that backup manifest/README, adopted legislation, Records/Code durability, support bundle, and repair remain green.
