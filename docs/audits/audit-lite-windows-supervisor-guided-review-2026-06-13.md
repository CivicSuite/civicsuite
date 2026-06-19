# Audit Lite: Windows Supervisor Guided Review

Date: 2026-06-13

Scope: System Health guided review for local lifecycle actions in the Windows desktop shell, covering backup, restore, uninstall, repair, and stop before mutation.

## Findings

No open findings.

## Fixed During Audit

- Low - The initial browser coverage checked backup, repair, and uninstall review gates but did not exercise the service stop action, even though stop is the service-disable equivalent in the current UI. Fixed by adding a Playwright assertion that `Stop` opens a guided review and does not mutate immediately. Evidence: `desktop/tests/browser/model-readiness.spec.mjs:79`.

## Evidence Reviewed

- `desktop/src/main.js`: supervisor review state is tracked separately from city-work review state; backup, restore, uninstall, repair, and stop require a review before calling `supervisor_action`.
- `desktop/src/main.js`: guided review copy names current status, what will change, visibility, audit/manifest evidence, sources, and retry path for profile-level and service-level lifecycle actions.
- `desktop/tests/browser/model-readiness.spec.mjs`: browser walkthrough proves backup opens review first, confirm then reaches the desktop-bridge guard, and repair/stop/uninstall review panels render before mutation.

## Verification

- `npm run test:browser` from `desktop` passed: 11 passed.
- `npm test` from `desktop` passed: desktop static smoke checks.
- `git diff --check` passed before adding this audit record.

## Residual Risk

- This slice is browser-preview UX coverage only. Real backup/restore/uninstall behavior remains covered by existing Rust supervisor tests and still needs the planned installed MSI cleanroom walkthrough after a current MSI artifact is available.
