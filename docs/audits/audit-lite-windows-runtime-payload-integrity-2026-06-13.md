# Audit Lite: Windows Runtime Payload Integrity

Date: 2026-06-13
Branch: work/windows-local-1-design-contract
Slice: Windows runtime payload lock generation and supervisor checksum verification.

## Findings

None.

Severity counts: Blocker 0, Critical 0, Major 0, Minor 0, Nit 0.

## Evidence Reviewed

- `desktop/scripts/prepare-runtime-payload.ps1:65` builds required-file lock entries with `size_bytes` and SHA-256 values.
- `desktop/scripts/prepare-runtime-payload.ps1:93` writes the Windows runtime payload lock from `desktop/runtime/windows-runtime-payloads.json`.
- `desktop/scripts/prepare-runtime-payload.ps1:621` attaches payload lock entries before writing `runtime-payload-lock.json`.
- `desktop/runtime/windows-runtime-payloads.json:30` now uses concrete Python package marker files instead of directory-only required paths.
- `desktop/src-tauri/src/supervisor.rs:68` defines the runtime payload lock contract consumed by the desktop supervisor.
- `desktop/src-tauri/src/supervisor.rs:557` verifies each required file's existence, byte size, and SHA-256 against the lock.
- `desktop/src-tauri/src/supervisor.rs:636` verifies source payloads before copy and copied payloads after install/repair.
- `desktop/src-tauri/src/supervisor.rs:2127` verifies a tampered required executable is rejected with a structured `Needs runtime files` result.
- `desktop/tests/static-smoke.mjs:219` guards the PowerShell lock generator and `desktop/tests/static-smoke.mjs:237` guards supervisor integrity enforcement.
- Local script run produced `desktop/runtime/payload/runtime-payload-lock.json` with schema/profile and required-file hash entries for the prepared local payload.

## Verification

- `powershell -NoProfile -ExecutionPolicy Bypass -File desktop/scripts/prepare-runtime-payload.ps1 -SkipDownloads -SkipPgvectorBuild` passed and generated a required-file hash lock from the existing local payload.
- `cargo fmt --check` passed in `desktop/src-tauri`.
- `cargo test supervisor_install` passed in `desktop/src-tauri`: 3 passed, 0 failed.
- `cargo test` passed in `desktop/src-tauri`: 84 passed, 0 failed.
- `npm test` passed in `desktop`: static smoke checks passed.
- `git diff --check` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.

## Residual Risk

This slice verifies required runtime files listed in the payload manifest. It does not yet produce clean-machine install/reboot/uninstall evidence or verify every transitive Python dependency file; those remain part of the MSI cleanroom gate.
