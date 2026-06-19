# Audit Lite: Windows Local User Recovery

Date: 2026-06-14

Scope:
- `desktop/src-tauri/src/auth.rs`
- `desktop/src/main.js`
- `desktop/tests/static-smoke.mjs`
- `docs/design/windows-desktop-design-control.md`
- `docs/installer/operator-walkthrough.md`

## Findings

None.

## Evidence

- CivicCore now has local-admin-only `reactivate-user` and `reset-user-passcode` auth actions, both blocked behind the existing admin session gate. Evidence: `desktop/src-tauri/src/auth.rs:475`, `desktop/src-tauri/src/auth.rs:500`, `desktop/src-tauri/src/auth.rs:595`, and `desktop/src-tauri/src/auth.rs:607`.
- The reset path refuses the first local administrator, requires a temporary passcode of at least 10 characters, rehashes with Argon2id, and updates the stored staff record. Evidence: `desktop/src-tauri/src/auth.rs:500`.
- Regression coverage proves a disabled staff user can receive a reset passcode, be re-enabled, fail with the old passcode, and sign in with the new passcode. Evidence: `desktop/src-tauri/src/auth.rs:762`.
- The Settings Local Users UI exposes Enable and Reset Passcode row actions for staff users and tells the local admin to enter a temporary passcode before resetting a staff account. Evidence: `desktop/src/main.js:4056`, `desktop/src/main.js:4064`, and `desktop/src/main.js:4083`.
- Static smoke pins the new action ids and labels. Evidence: `desktop/tests/static-smoke.mjs:38` and `desktop/tests/static-smoke.mjs:503`.
- Design and operator walkthrough docs now describe add, disable, re-enable, and staff passcode reset as the supported Local Users admin journey. Evidence: `docs/design/windows-desktop-design-control.md:82` and `docs/installer/operator-walkthrough.md:68`.

## Verification

- `cargo fmt`
- `cargo test reset_and_reactivate -- --test-threads=1 --nocapture`
- `cargo test -- --test-threads=1`
- `cargo check`
- `npm test -- --runInBand`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`

## Residual Risk

This slice covers local user recovery in the desktop profile. It does not add password self-service, external SSO, or first-admin recovery beyond the existing first-run recovery boundary.
