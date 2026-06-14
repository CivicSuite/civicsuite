# Audit Lite: Windows Admin UI Gates

Date: 2026-06-14
Scope: Desktop UI gating for local-admin-only setup, model, lifecycle, and runtime service controls.

## Verdict

PASS.

Unresolved findings: 0 Blocker / 0 Critical / 0 Major / 0 Minor / 0 Nit.

## Findings

None.

## Evidence Reviewed

- `desktop/src/main.js:1010` adds one shared configured-profile admin lock helper so signed-in staff and signed-out users after first-admin setup see the same lock state.
- `desktop/src/main.js:1343` applies that lock to local model setup controls instead of only requiring any signed-in user.
- `desktop/src/main.js:4404` disables guided supervisor confirmation when the current profile is configured and the active user is not a local administrator.
- `desktop/src/main.js:4565` disables System Health backup, restore, uninstall, support bundle, service install, service start, service repair, log, and stop actions for non-admin users while keeping health visibility.
- `desktop/src-tauri/src/main.rs:395`, `desktop/src-tauri/src/main.rs:435`, and `desktop/src-tauri/src/main.rs:440` remain the authoritative backend guard for model and supervisor actions.
- `desktop/tests/static-smoke.mjs:177` adds a regression guard for the shared admin helper and disabled supervisor controls.

## Verification Evidence

- `npm test`: passed.
- `npm run test:browser`: passed, 11 tests.
- `npm run build`: passed.
- `bash scripts/verify-docs.sh`: passed.
- `git diff --check`: passed with only CRLF normalization warnings.

## Residual Risk

This slice covers static rendering and browser-preview smoke. It does not replace the later clean-machine walkthrough where real local-admin and staff accounts must be exercised in the packaged Windows desktop app.
