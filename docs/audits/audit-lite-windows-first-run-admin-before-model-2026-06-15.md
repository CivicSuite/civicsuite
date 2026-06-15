# Audit Lite - Windows First-Run Admin Before Model

Date: 2026-06-15

Scope: Windows Local first-run setup order, local-admin handoff copy, docs, and
focused regression coverage.

## Findings

No unresolved findings.

During audit, one Medium issue was found and fixed before commit: the native
model setup action still told users to continue to city profile setup after the
model step. That became stale once the model step moved after city profile,
first admin, and backup. The action now directs users to health verification,
and `first_run_model_action_advances_when_model_is_verified` asserts that copy.

## Evidence

- `desktop/runtime/windows-first-run.json` now orders setup as city profile,
  first local administrator, backup, local model download, then health.
- `desktop/src/main.js` mirrors the same browser fallback setup order and tells
  users to sign in with the first local-admin passcode before continuing setup.
- `desktop/src-tauri/src/first_run.rs` asserts city profile before first admin
  and first admin before model, and returns the corrected post-model next
  action.
- `desktop/src-tauri/src/main.rs` asserts the first-admin bootstrap result tells
  the user to sign in.
- `desktop/tests/static-smoke.mjs` locks the first-admin-before-model manifest
  order.
- `docs/design/windows-desktop-design-control.md`,
  `docs/installer/operator-walkthrough.md`, `README.md`, `USER-MANUAL.md`, and
  `STATUS.md` now describe the same clerk setup order.

## Verification

- `npm test`
- `cargo test first_run --manifest-path desktop\src-tauri\Cargo.toml`
- `npm run build`
- `npm run test:browser -- tests/browser/model-readiness.spec.mjs`

## Residual Risk

The full cleanroom proof still depends on the tester completing the installed
MSI walkthrough, including actual local-admin creation, model download behavior,
and city-core workflows on the tester machine.
