# Audit Lite - Windows Public State Auth Boundary - 2026-06-13

## Findings

None unresolved.

## Scope Reviewed

- `desktop/src-tauri/src/main.rs:101` adds a shared local-admin access predicate and uses it to split full staff state from public state.
- `desktop/src-tauri/src/main.rs:105` and `desktop/src-tauri/src/main.rs:111` sanitize unauthenticated model path and runtime health admin details before `get_app_state` returns them.
- `desktop/src-tauri/src/main.rs:119` returns full `users`, `health`, `model`, and `city_work` only for a signed-in local admin; unauthenticated state receives public projections.
- `desktop/src-tauri/src/main.rs:202` applies the same public/full split to direct city-work state refreshes.
- `desktop/src-tauri/src/main.rs:212` allows only public-safe city actions without an admin session, requires first-run ownership first, forces public code Q&A to public-only citations, and sanitizes the returned action state.
- `desktop/src-tauri/src/workflows.rs:750` keeps public comments closed until the meeting notice is posted.
- `desktop/src-tauri/src/workflows.rs:2021` defines the public city-work projection: posted/archived meeting materials only, reviewed/redacted public comments only, released records requests only, published code sources only, no handoffs, and no staff audit entries.
- `desktop/src/main.js:1300` aligns the Resident/Public meeting filter with the backend by not treating a private packet export as public by itself.

## Verification

- `cargo test city_work -- --nocapture` passed.
- `cargo test app_state_reports_saved_city_profile_and_first_admin -- --nocapture` passed.
- `cargo test unauthenticated_city_work_state_is_public_projection -- --nocapture` passed.
- `cargo test` passed: 69 passed.
- `npm test` passed: static smoke checks.
- `npm run test:browser` passed: 10 Playwright tests.
- `cargo fmt --check` passed.
- `bash scripts/verify-docs.sh` passed.
- `python scripts/policy/check_stage_evidence.py` passed.
- `git diff --check` passed.

## Residual Risk

Clean-machine evidence still needs the later full Windows install walkthrough gate. This slice is locally verified for the Tauri command boundary, public projection rules, staff restoration after sign-in, and browser public-surface rendering.
