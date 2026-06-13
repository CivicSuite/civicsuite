# Audit Lite: Windows Public Surface Separation

Date: 2026-06-13
Scope: Resident/Public desktop surface rendering for meetings, records, code, search, and local admin gating.

## Findings

No findings.

## Evidence

- The home header now follows the selected surface instead of hard-coding Staff in `desktop/src/main.js:505`.
- Public-readable areas are explicitly limited to home, meetings, records, code, and search in `desktop/src/main.js:847`.
- Public meetings render a read-only `Public Meeting Materials` workflow and only include public-notice-ready or packet-exported meetings in `desktop/src/main.js:851` and `desktop/src/main.js:857`.
- Public records render a read-only `Public Records Status` workflow and only include exported records responses in `desktop/src/main.js:937` and `desktop/src/main.js:941`.
- Public code renders municipal code sources without staff import or clerk handoff controls in `desktop/src/main.js:1003`.
- Public search avoids the audit-backed staff search action and searches only public-safe meeting and records lists in `desktop/src/main.js:1068` and `desktop/src/main.js:1093`.
- The local admin gate still protects non-public areas after first-admin setup while allowing public-readable areas in `desktop/src/main.js:1254`.
- Browser coverage verifies the Resident/Public surface hides staff controls for meetings, records, code, and search in `desktop/tests/browser/workflow-pages.spec.mjs:31`.

## Verification

- `npm test` passed.
- `npm run build` passed.
- `npm run test:browser` passed: 9 passed.
- `git diff --check` passed.

## Residual Risk

- CivicCode sources currently have an imported/synced operational status, not a separate public-publication state. This slice prevents staff-only controls and handoffs from appearing on the Resident/Public surface; a richer published-vs-internal code-source lifecycle should be handled in the CivicCode workflow contract slice.
