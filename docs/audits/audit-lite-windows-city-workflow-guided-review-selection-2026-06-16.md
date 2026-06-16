# Audit Lite: Windows City Workflow Guided Review Selection

Date: 2026-06-16
Scope: PR #192 Windows Local follow-up for TESTER-RESULT-080.md.

## Findings

No unresolved Blocker, Critical, Major, Minor, or Nit findings for this slice.

## Trigger

TESTER-RESULT-080.md passed the System Health/model/runtime baseline from the prior directive, but failed deep city-core workflows. The result showed early unguided actions persisted while guided actions and lifecycle controls did not produce durable state: staff sign-in was not proven, meeting body/member/meeting/code-source/records-release work did not advance, and Backup Now / Create Support Bundle / Repair did not produce fresh lifecycle evidence.

## Fix Reviewed

- [desktop/src/main.js](../../desktop/src/main.js): renders city-work guided review panels at the top of Meetings, Records, and Code surfaces, and scrolls the pending review into view when a guided action is requested.
- [desktop/src/main.js](../../desktop/src/main.js): renders System Health lifecycle review panels at the top of the health surface and scrolls to them for backup, support bundle, repair, restore, stop, and uninstall confirmations.
- [desktop/src/main.js](../../desktop/src/main.js): adds post-action work selection reconciliation so newly created meeting bodies, members, meetings, agenda items, records requests, records documents, code sources, and code handoffs become the active targets for the next action.
- [desktop/src/main.js](../../desktop/src/main.js): keeps the newly created staff email as the next sign-in candidate and adds an explicit desktop-side temporary-passcode length guard.
- [desktop/tests/browser/workflow-pages.spec.mjs](../../desktop/tests/browser/workflow-pages.spec.mjs), [desktop/tests/browser/model-readiness.spec.mjs](../../desktop/tests/browser/model-readiness.spec.mjs), and [desktop/tests/static-smoke.mjs](../../desktop/tests/static-smoke.mjs): cover typed guided review panels and the new frontend resilience contracts.

## Evidence

- `npm --prefix desktop test`
- `npm --prefix desktop run test:browser -- desktop/tests/browser/workflow-pages.spec.mjs desktop/tests/browser/model-readiness.spec.mjs`
- `npm --prefix desktop run build`
- `cargo fmt --check`
- `cargo test -- --test-threads=1`
- `bash scripts/verify-docs.sh`

## Residual Risk

This still needs a fresh Windows Local MSI and tester rerun. TESTER-DIRECTIVE-081 should explicitly tell the tester to click the visible Confirm button for guided workflow and lifecycle review panels, then verify durable meeting, records, code, public intake, backup/support/repair, uninstall/reinstall, and restore evidence.
