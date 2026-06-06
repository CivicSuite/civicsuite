# Walkthrough - Stage 3A Proven-Suite Local Integration

Date: 2026-06-05
Branch: `stage-3a-baremetal-windows`
Scope: repo-local Stage 3A `proven-suite` smoke install at `installer/runtime/proven-suite-local-smoke`

## Verdict

GREEN for local UI wiring. The suite launcher rendered on desktop and mobile,
listed all ten selected services, and routed each visible module tile to a live
local service surface. CivicCode was corrected during this walkthrough so the
launcher opens the HTML CivicCode surface at `/civiccode` instead of the API JSON
root.

This is not a clean-machine gate, public-use readiness, city-ready status,
procurement readiness, production readiness, macOS lifecycle certification,
airgap readiness, or full-suite release.

## Evidence

- Install lifecycle evidence:
  `installer/reports/stage3a-proven-suite-local-smoke/clerk-core-installer-lifecycle.json`
- Verify lifecycle evidence:
  `installer/reports/stage3a-proven-suite-local-smoke-verify-after-launcher-port-fix/clerk-core-installer-lifecycle.json`
- Playwright walkthrough evidence:
  `installer/reports/stage3a-proven-suite-walkthrough-2026-06-05-r2/walkthrough-results.json`
- Screenshots:
  `installer/reports/stage3a-proven-suite-walkthrough-2026-06-05-r2/launcher-desktop.png`
  and `installer/reports/stage3a-proven-suite-walkthrough-2026-06-05-r2/launcher-mobile.png`

## Routes Checked

| Module | Local route | Result |
|---|---|---|
| CivicRecords AI | `http://127.0.0.1:22280/` | HTML surface rendered |
| CivicClerk | `http://127.0.0.1:22281/` | HTML surface rendered |
| CivicCode | `http://127.0.0.1:23020/civiccode` | HTML surface rendered |
| CivicZone | `http://127.0.0.1:23030/civiczone` | HTML surface rendered |
| CivicPlan | `http://127.0.0.1:23040/civicplan` | HTML surface rendered |
| CivicPermit | `http://127.0.0.1:23050/civicpermit` | HTML surface rendered |
| CivicAccess | `http://127.0.0.1:23060/civicaccess` | HTML surface rendered |
| CivicInspect | `http://127.0.0.1:23061/civicinspect` | HTML surface rendered |
| CivicGrants | `http://127.0.0.1:23062/civicgrants` | HTML surface rendered |
| CivicProcure | `http://127.0.0.1:23063/civicprocure` | HTML surface rendered |

## Expected Protected-Mode Signal

CivicClerk returned `401` for `GET /staff/session` in protected staff mode. The
page rendered the expected "Staff sign-in needed" copy and remediation text, so
this is classified as expected protected-default behavior, not a walkthrough
finding.

## Findings

No unresolved walkthrough findings remain for the local proven-suite launcher
wiring pass.
