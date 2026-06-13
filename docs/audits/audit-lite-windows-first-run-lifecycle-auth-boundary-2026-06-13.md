# Audit Lite - Windows First-Run Lifecycle Auth Boundary - 2026-06-13

## Findings

None unresolved.

## Scope Reviewed

- `desktop/src-tauri/src/main.rs:118` identifies first-run lifecycle escape-hatch actions that need admin ownership after the first local admin exists.
- `desktop/src-tauri/src/main.rs:193` blocks `repair`, `backup`, and `uninstall` through the Tauri first-run command when the configured local admin is signed out, while preserving the ordinary first-run setup sequence.
- `desktop/src-tauri/src/main.rs:420` verifies signed-out lifecycle backup is blocked and signed-in backup remains accepted.
- `desktop/tests/static-smoke.mjs:143` guards that the desktop shell keeps the first-run lifecycle admin requirement.

## Verification

- `cargo test first_run_lifecycle_actions_require_admin_after_first_admin_exists -- --nocapture` passed.
- `cargo test` passed: 72 passed.
- `npm test` passed: static smoke checks.
- `npm run test:browser` passed: 10 Playwright tests.
- `cargo fmt --check` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.
- `git diff --check` passed.

## Residual Risk

Clean-machine install and uninstall evidence still belongs to the later full Windows walkthrough gate. This slice is locally verified for the Tauri first-run lifecycle command boundary and static regression guard.
