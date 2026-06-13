# Audit Lite - Windows Model Action Auth Boundary - 2026-06-13

## Findings

None unresolved.

## Scope Reviewed

- `desktop/src-tauri/src/main.rs:162` now returns a public model state when the local admin is signed out, hiding the concrete model file path from unauthenticated app state reads.
- `desktop/src-tauri/src/main.rs:173` now blocks top-level model setup mutations after first admin creation unless the local admin is signed in.
- `desktop/src/main.js:829` disables model setup buttons in the signed-out configured state and shows a plain sign-in prompt instead of presenting active controls that fail later.
- `desktop/tests/static-smoke.mjs:139` guards that the desktop shell keeps the local admin requirement for model setup mutations.
- `desktop/src-tauri/src/main.rs:366` and `desktop/src-tauri/src/main.rs:386` cover signed-out model path hiding and signed-out model action blocking, then verify the signed-in path still works.

## Verification

- `cargo test model_state_hides_local_path_without_admin_session -- --nocapture` passed.
- `cargo test model_actions_require_admin_after_first_admin_exists -- --nocapture` passed.
- `cargo test` passed: 71 passed.
- `npm test` passed: static smoke checks.
- `npm run test:browser` passed: 10 Playwright tests.
- `cargo fmt --check` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.
- `git diff --check` passed.

## Residual Risk

Clean-machine install evidence still belongs to the later full Windows walkthrough gate. This slice is locally verified for the Tauri model state/action boundary, browser UI affordance, and static regression guard.
