# Audit Lite: Windows Search Copy Cleanup

Date: 2026-06-13

Scope: Desktop shell search/module/meeting metadata copy cleanup and regression guards.

## Findings

None.

## Evidence Reviewed

- `desktop/src/main.js:1666` now renders meeting metadata with ASCII separators instead of mojibake.
- `desktop/src/main.js:2111` now gives staff and Resident/Public search their own empty-state copy.
- `desktop/src/main.js:2116` now renders search result citation/status metadata with ASCII separators.
- `desktop/src/main.js:2161` now renders module contract metadata with ASCII separators.
- `desktop/tests/browser/workflow-pages.spec.mjs:60` verifies the staff search empty state.
- `desktop/tests/browser/workflow-pages.spec.mjs:117` verifies the Resident/Public search empty state and `desktop/tests/browser/workflow-pages.spec.mjs:119` verifies the staff wording is absent there.
- `desktop/tests/static-smoke.mjs:61` guards the desktop shell against the mojibake and non-ASCII middle-dot separators returning by code point.

## Verification

- `npm test` in `desktop`: PASS.
- `npm run test:browser -- workflow-pages.spec.mjs` in `desktop`: PASS, 6 passed.
- Mojibake and middle-dot scan across the touched UI/test files: PASS, no matches.
- `git diff --check`: PASS.
- `bash scripts/verify-docs.sh`: PASS.
- `python scripts/policy/check_stage_evidence.py`: PASS.

## Residual Risk

This was a focused desktop UI copy slice. It does not replace the later clean-machine walkthrough requirement for search, module manager, and workflow surfaces.
