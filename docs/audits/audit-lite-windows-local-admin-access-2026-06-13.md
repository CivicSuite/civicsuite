# Audit Lite: Windows Local Admin Access

Date: 2026-06-13
Scope: First-admin local passcode, desktop local access state, sign-in/sign-out, and admin gating for mutating Tauri commands.

## Findings

No findings.

## Evidence

- First-admin setup now requires a local passcode and stores only a salted hash record in `desktop/src-tauri/src/first_run.rs:420`.
- Passcode verification is implemented in `desktop/src-tauri/src/first_run.rs:449`.
- Local access state, sign-in, sign-out, session validation, and admin-session enforcement are implemented in `desktop/src-tauri/src/auth.rs:12`, `desktop/src-tauri/src/auth.rs:142`, `desktop/src-tauri/src/auth.rs:176`, and `desktop/src-tauri/src/auth.rs:187`.
- Tauri app state exposes access status in `desktop/src-tauri/src/main.rs:39`.
- Mutating supervisor actions and city workflow actions require an admin session in `desktop/src-tauri/src/main.rs:157` and `desktop/src-tauri/src/main.rs:172`.
- The desktop UI renders local passcode fields and a local sign-in panel in `desktop/src/main.js:575`, `desktop/src/main.js:667`, `desktop/src/main.js:1076`, and `desktop/src/main.js:1395`.
- Browser coverage asserts the local passcode field in `desktop/tests/browser/workflow-pages.spec.mjs:58`.

## Verification

- `cargo test` passed: 49 passed, no warnings.
- `npm test` passed.
- `npm run build` passed.
- `npm run test:browser` passed after adding the passcode assertion: 8 passed.
- `git diff --check` passed.

## Residual Risk

- This is local desktop access control for the Windows profile. Full multi-user administration, password recovery, and enterprise SSO remain broader CivicCore work; mutating desktop commands are now protected by the local admin session instead of being open after first-run setup.
