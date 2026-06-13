# Audit Lite: Windows Module Guided Review

Date: 2026-06-13
Branch: `work/windows-local-1-design-contract`
Scope: `desktop/src/main.js`, `desktop/tests/browser/workflow-pages.spec.mjs`, `desktop/tests/static-smoke.mjs`

## Findings

None.

## Evidence

- `desktop/src/main.js:496` tracks pending module lifecycle review state separately from city-work and runtime-service review state.
- `desktop/src/main.js:2429` requires guided review for install, enable, disable, update, and remove module actions.
- `desktop/src/main.js:2441` defines module-specific review copy covering changes, visibility, evidence, audit trail, and retry behavior.
- `desktop/src/main.js:2510` renders the guided module review panel with confirmation and cancel actions.
- `desktop/src/main.js:2760` places the module review inside Settings before the module manager controls.
- `desktop/src/main.js:3003` wires confirmed module review actions back into the same desktop command handler.
- `desktop/src/main.js:3157` blocks module action execution until review is confirmed.
- `desktop/tests/browser/workflow-pages.spec.mjs:214` verifies disabling CivicCode opens review before the browser-preview desktop bridge guard appears.
- `desktop/tests/static-smoke.mjs:313` guards the module guided-review renderer and confirmation attributes.

## Verification

- `npm test`
- `npm run test:browser`
- `npm run build`
- `bash scripts/verify-docs.sh`
- `python scripts/policy/check_stage_evidence.py`
- `git diff --check`

## Residual Risk

This slice covers the desktop Settings UI review path. Real installed-app confirmation still needs the clean-machine MSI walkthrough gate after a current artifact is available.
