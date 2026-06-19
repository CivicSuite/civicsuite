# Audit Lite: Windows Postgres zlib Runtime Dependency

Date: 2026-06-18

Scope:
- Follow-up to `test-comms/POSTGRES-ZLIB1-RUNTIME-TEST-REPORT.md`.
- Runtime payload contract and profile runtime materialization for PR #192 Windows Local MSI.

Tester finding:
- `postgres.exe` existed in the user-profile runtime at `runtime/postgres/bin`.
- `zlib1.dll` was missing from the user-profile runtime.
- The MSI payload under Program Files did contain `postgres/bin/zlib1.dll`.
- PostgreSQL failed with a Windows loader error before it could bind `127.0.0.1:15432`.

Root cause:
- The payload install/repair skip check only verified the files listed in `windows-runtime-payloads.json`.
- `bin/zlib1.dll` was not in the required PostgreSQL payload contract or payload lock.
- A stale copied runtime with the old required files present could be treated as valid even though `postgres.exe` could not load its DLL dependency.

Fix:
- Added `bin/zlib1.dll` to the PostgreSQL required payload files.
- Regenerated the payload lock metadata with the matching SHA-256 and byte count.
- Added a regression proving `install` repairs a stale PostgreSQL runtime that has `pg_ctl.exe`, `initdb.exe`, and `postgres.exe` but is missing `zlib1.dll`.

Validation:
- `cargo fmt --manifest-path desktop/src-tauri/Cargo.toml --check`
- `cargo test supervisor_install_repairs_stale_postgres_runtime_missing_zlib --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test payload_manifest_covers_runtime_services --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`
- `cargo test supervisor_install_copies_bundled_runtime_payload --manifest-path desktop/src-tauri/Cargo.toml -- --test-threads=1`

Audit conclusion:
- The product will now force runtime repair when the copied Postgres runtime is missing `zlib1.dll`.
- The regenerated payload lock prevents the source or copied DLL from silently drifting in the packaged runtime.
- A fresh MSI and installed-app tester pass are still required because this defect only appears in packaged Windows runtime lifecycle.
