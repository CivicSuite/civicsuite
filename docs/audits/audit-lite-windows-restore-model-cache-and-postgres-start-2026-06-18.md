# Audit Lite: Windows Restore Model Cache and Postgres Start Recovery

Date: 2026-06-18
Branch: `work/windows-local-1-design-contract`
Scope: PR #192 Windows Local restore-after-reinstall failure from `TESTER-RESULT-093.md`.

## Result

Pass with local evidence. `TESTER-RESULT-093.md` showed the desktop shell no longer froze, but `Restore Latest Backup` still stayed in `Working` for about 330 seconds, and Local data store start returned `exit code: 1`. The fix keeps restore bounded by treating model blobs as runtime cache during restore safety work, preserving the current model cache across the Data swap, and adding stale Postgres PID cleanup plus log-tail diagnostics before start.

## Changes Audited

- `desktop/src-tauri/src/supervisor.rs`
  - Added restore copy options that skip source `Data/models` during profile restore.
  - Added pre-restore backup options that intentionally skip local model cache and record a skipped-file reason in the backup manifest.
  - Preserves the existing current-profile model cache after swapping restored city Data into place.
  - Clears stale `postmaster.pid` when no local data-store TCP listener is present and the recorded PID is not running.
  - Returns recent Postgres log output when Local data store start fails.
  - Added regression coverage for model-cache-preserving restore and stale Postgres PID cleanup.

## Local Verification

- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test stale_postgres_pid_file_is_removed_before_start --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test postgres_start_verifies_database_even_when_tcp_port_is_open --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/model-readiness.spec.mjs desktop/tests/browser/workflow-pages.spec.mjs`
- `npm --prefix desktop run build`
- `bash scripts/verify-docs.sh`
- `python scripts/verify-deployment-profile.py --static-only`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check` with CRLF normalization warnings only.

## Remaining Risk

The installed-app gate still needs bare-metal confirmation. `TESTER-RESULT-093.md` also showed Clerk adopted-legislation evidence was incomplete because the visible flow did not complete adoption prerequisites; the backend integrity gates are retained, and the next directive should explicitly require a minute citation and passed motion before recording adopted legislation.
