# Audit Lite - Windows Admin Passcode KDF - 2026-06-13

Scope: Windows Local 1.0 first-admin passcode storage and verification hardening.

## Findings

No unresolved findings.

## Evidence

- The desktop crate now depends on the standard Argon2 password-hashing implementation instead of relying only on the prior repeated SHA-256 helper. Evidence: `desktop/src-tauri/Cargo.toml:12`, `desktop/src-tauri/Cargo.lock:51`.
- New first-admin records store an explicit `argon2id-v1` algorithm marker and PHC-format Argon2id hash. Evidence: `desktop/src-tauri/src/first_run.rs:42`, `desktop/src-tauri/src/first_run.rs:152`, `desktop/src-tauri/src/first_run.rs:437`, `desktop/src-tauri/src/first_run.rs:480`.
- Existing SHA-256 first-admin records remain accepted through the legacy marker/default and are upgraded to Argon2id after a successful passcode verification. Evidence: `desktop/src-tauri/src/first_run.rs:497`, `desktop/src-tauri/src/first_run.rs:522`, `desktop/src-tauri/src/first_run.rs:529`.
- Regression coverage verifies new Argon2id storage does not include the plaintext passcode and that a legacy SHA-256 record upgrades after successful verification. Evidence: `desktop/src-tauri/src/first_run.rs:922`, `desktop/src-tauri/src/first_run.rs:949`.

## Verification

- `cargo test passcode` passed: 2 passed.
- `cargo test` passed: 76 passed.

## Residual Risk

This improves the local beta admin secret boundary, but broader user/role management beyond the first local administrator still belongs to a later CivicCore user-management slice.
