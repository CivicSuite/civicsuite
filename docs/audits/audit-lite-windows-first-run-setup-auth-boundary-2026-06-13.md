# Audit Lite - Windows First-Run Setup Auth Boundary - 2026-06-13

## Findings

None unresolved.

## Scope Reviewed

- `desktop/src-tauri/src/main.rs:118` now treats every first-run/setup action that mutates local setup, profile, model readiness, backup, or runtime state as admin-owned after the first local admin exists.
- `desktop/src-tauri/src/main.rs:206` blocks those Tauri command calls when the configured local admin is signed out.
- `desktop/src-tauri/src/main.rs:431` verifies signed-out city-profile, model-download, and backup attempts are blocked after first-admin creation.
- `desktop/src-tauri/src/main.rs:483` verifies city-profile and first-admin creation still bootstrap correctly before an admin exists.
- `desktop/src/main.js:698` disables the current first-run action in the UI when setup is configured but the local admin session is signed out.
- `desktop/tests/static-smoke.mjs:37` guards the visible setup lock text and broader admin access language.

## Verification

- `cargo fmt` passed.
- `cargo test first_run_setup_actions` passed: 2 passed.
- `cargo test` passed: 73 passed.
- `npm test` passed: static smoke checks.
- `npm run test:browser` passed: 11 Playwright tests.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.
- `git diff --check` passed.

## Residual Risk

Clean-machine setup, sign-in continuity, model download, backup, restore, and uninstall evidence still belongs to the later MSI walkthrough gate. This slice closes the local command and UI authorization boundary for setup/profile/model/runtime mutations after first-admin ownership exists.
