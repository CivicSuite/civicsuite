# Audit Lite - Windows Guided Civic Actions

Date: 2026-06-13
Scope: Guided review UX for risky CivicClerk, CivicRecords AI, and CivicCode workflow actions in the Windows Local 1.0 desktop shell.

## Findings

No unresolved findings.

## Coverage

- Risky civic workflow actions now route through a guided review state before the desktop app invokes the existing local mutation command. Evidence: `desktop/src/main.js:366`, `desktop/src/main.js:876`, `desktop/src/main.js:2048`.
- The review contract covers meeting notice posting, packet export, minutes adoption, public archive, code handoff-to-agenda, records approval/export/fulfillment/close, code guidance approval, code publication/retraction, and code-to-clerk handoff creation. Evidence: `desktop/src/main.js:876`, `desktop/src/main.js:912`.
- Review panels show current status, what will change, public/internal visibility, source evidence, audit trail impact, and safe retry behavior before confirmation. Evidence: `desktop/src/main.js:1126`.
- Dynamic review text is escaped before rendering, avoiding an additional raw interpolation path for requester, meeting, code, or handoff text. Evidence: `desktop/src/main.js:908`, `desktop/src/main.js:1132`.
- Meetings, Records, and Code pages render the guided review panel inline with their workflow controls, and navigation/surface changes clear pending reviews. Evidence: `desktop/src/main.js:1248`, `desktop/src/main.js:1355`, `desktop/src/main.js:1447`, `desktop/src/main.js:1771`.
- Browser coverage verifies that risky actions open review first, cancel avoids mutation, confirmation is the only path that reaches the desktop-save boundary, and Records/Code review copy appears. Evidence: `desktop/tests/browser/workflow-pages.spec.mjs:91`.

## Verification

- `cargo test`: pass, 60 tests.
- `npm test`: pass.
- `npm run test:browser`: pass, 10 tests.
- `cargo fmt --check`: pass.
- `bash scripts/verify-docs.sh`: pass.
- `python scripts/policy/check_stage_evidence.py`: pass.
- `git diff --check`: pass.

## Residual Risk

- The guided review summarizes the same first/current workflow record targeted by the existing local backend actions. Multi-record picker UX remains a separate workflow-depth improvement once the city-core screens move beyond the current single-current-record operation model.
