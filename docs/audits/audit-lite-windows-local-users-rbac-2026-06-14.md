# Audit Lite: Windows Local Users And RBAC

Date: 2026-06-14

Scope:
- `desktop/src-tauri/src/auth.rs`
- `desktop/src-tauri/src/first_run.rs`
- `desktop/src-tauri/src/main.rs`
- `desktop/src/main.js`
- `desktop/src/styles.css`
- `desktop/playwright.config.mjs`
- `desktop/tests/browser/model-readiness.spec.mjs`
- `desktop/tests/browser/workflow-pages.spec.mjs`
- `desktop/tests/static-smoke.mjs`
- `docs/design/windows-desktop-design-control.md`
- `docs/installer/operator-walkthrough.md`

## Findings

None.

## Evidence

- CivicCore now has durable local staff users in `staff-users.json`, combined local-user summaries, and local administrator-only create/disable actions. Evidence: `desktop/src-tauri/src/auth.rs:23`, `desktop/src-tauri/src/auth.rs:153`, `desktop/src-tauri/src/auth.rs:408`, and `desktop/src-tauri/src/auth.rs:452`.
- Staff sign-in uses the same Argon2 local-passcode verification path as the first administrator and invalidates disabled users or changed session hashes. Evidence: `desktop/src-tauri/src/auth.rs:166`, `desktop/src-tauri/src/auth.rs:222`, and `desktop/src-tauri/src/auth.rs:475`.
- City-work access is signed-in for staff/admin users and role-scoped by module, while setup, runtime, model, modules, backup, restore, and user management remain local-admin only. Evidence: `desktop/src-tauri/src/auth.rs:369`, `desktop/src-tauri/src/auth.rs:390`, `desktop/src-tauri/src/main.rs:122`, and `desktop/src-tauri/src/main.rs:586`.
- Cross-module search results are filtered by installed modules and the signed-in role, so records, clerk, and code staff do not see unrelated module results. Evidence: `desktop/src-tauri/src/main.rs:312` and `desktop/src-tauri/src/main.rs:618`.
- The Settings surface exposes Local Users with staff name, email, role, temporary passcode, create, and disable controls, and non-admin signed-in staff are blocked from Settings rather than seeing admin-only setup controls. Evidence: `desktop/src/main.js:4029`, `desktop/src/main.js:4690`, and `desktop/src/main.js:4518`.
- Regression coverage proves staff creation, staff sign-in, disabled-user rejection, and module-role gating across records, clerk, and code workflows. Evidence: `desktop/src-tauri/src/auth.rs:611`, `desktop/src-tauri/src/auth.rs:649`, and `desktop/src-tauri/src/main.rs:896`.
- Browser walkthrough coverage now includes Local Users controls in Settings and uses a 60-second test budget to avoid false negatives on slower Windows local runs. Evidence: `desktop/tests/browser/workflow-pages.spec.mjs:444` and `desktop/playwright.config.mjs:7`.

## Verification

- `cargo fmt`
- `cargo test staff_user -- --test-threads=1`
- `cargo test -- --test-threads=1`
- `npm test -- --runInBand`
- `npm run test:browser`
- `npm run build`
- `cargo check`
- `python scripts\verify-module-manifest-contract.py`
- `python scripts\verify-deployment-profile.py --static-only`
- `python scripts\verify-installer-plan.py`
- `bash scripts/verify-docs.sh`
- `git diff --check`

## Residual Risk

This slice proves durable local users, role-scoped city-work access, Settings UI wiring, and repo gates. It is not a clean-machine MSI install, reboot survival, backup/restore restore drill, support-bundle handoff, uninstall/reinstall, or end-to-end city-clerk beta walkthrough; those remain end-stage Windows Local 1.0 gates.
