# Audit Lite: Windows Restore Model Cache and Postgres Compression Recovery

Date: 2026-06-18

Scope:
- PR #192 Windows Local MSI follow-up after `TESTER-RESULT-096.md`.
- Runtime lifecycle fixes in `desktop/src-tauri/src/supervisor.rs`.

Tester failure addressed:
- Product Start/Check/Repair could not recover Local data store or City workflow services.
- Restore Latest Backup returned a bounded `Access is denied` failure while moving the live `Data` directory.
- Normal desktop close plus elevated MSI uninstall/reinstall was fixed by the prior head and remained out of scope for this patch.

Changes audited:
- Restore with model-cache preservation no longer renames the whole live `Data` folder before preserving `Data/models`.
- The restore path now moves current non-model Data children into the old-folder swap, moves restored non-model children into live `Data`, and leaves the live model cache in place.
- Postgres initialization/start now clears NTFS compression from the local data-store directory before `initdb` and `pg_ctl start`, covering low-disk cleanup cases where profile folders inherit compression.
- Postgres start readiness failures now include a recent local data-store log excerpt when available.
- The restore regression test now holds an open model-cache file handle while restoring to exercise the Windows locked-file failure class.

Validation:
- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test restore_replaces_profile_from_latest_backup --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test postgres_repair_moves_incomplete_data_store_before_reinitializing --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `CIVICSUITE_RUN_REAL_RUNTIME_COPY_TEST=1 CIVICSUITE_RUNTIME_PAYLOAD_DIR=desktop/src-tauri/target/release/_up_/runtime/payload cargo test real_copied_payload_repair_recovers_partial_postgres_when_enabled --manifest-path desktop/src-tauri/Cargo.toml -- --nocapture --test-threads=1`
- `cargo test --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`

Audit conclusion:
- The patch directly addresses the restore `Access is denied` mechanism by avoiding movement of the live model cache parent directory.
- The Postgres compression guard addresses the low-disk host cleanup condition observed in tester evidence and keeps Repair product-owned.
- Remaining release confidence depends on a fresh MSI and installed-app tester pass for `TESTER-DIRECTIVE-097.md`.
