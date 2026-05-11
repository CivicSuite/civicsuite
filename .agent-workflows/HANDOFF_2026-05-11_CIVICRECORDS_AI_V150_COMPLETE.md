# CivicRecords AI v1.5.0 Migration - Complete Handoff

Date: 2026-05-11

## Scope

CivicRecords AI migrated from CivicCore v0.22.1 to CivicCore v1.0.1, shipped as CivicRecords AI v1.5.0, and reconciled umbrella release truth so the full-suite installer profile is buildable again.

## Status

GREEN - complete.

The prior paused handoff `.agent-workflows/HANDOFF_2026-05-10_CIVICRECORDS_AI_V150_PAUSED.md` is superseded and removed by this completion handoff.

## Completed Work

- CivicSuite PR #119 corrected the CivicClerk B1 handoff tarball SHA at `35dfb8d0b8b888537bb5233f49eb0076831fba77`.
- CivicRecords AI PR #69 migrated the product to CivicCore v1.0.1 and bumped CivicRecords AI to v1.5.0 at `a0b1c467c43ebc84cfda25c7dab77d2d4d832292`.
- CivicRecords AI release workflow blockers were fixed in PRs #70, #71, #72, and #73.
- CivicRecords AI v1.5.0 release exists with installer and attestation assets.
- CivicSuite umbrella PR #121 reconciled spec, verifier, installer manifest, compatibility docs, release recovery status, and downstream pins at `3cf9f8289f1090b1c6dd9270d7e184793870df2d`.
- `python scripts/verify-suite-state.py --remote-only` passed for all 26 modules after PR #121 merged.

## Release

- Release URL: `https://github.com/CivicSuite/civicrecords-ai/releases/tag/v1.5.0`
- Setup asset: `CivicRecordsAI-1.5.0-Setup.exe`
- Setup SHA256: `b48e4591c6d7bde3476078ee648d89e8e6a4e18b24ff0487ec9762af690b8ac5`
- Release assets:
  - `CivicRecordsAI-1.5.0-Setup.exe`
  - `CivicRecordsAI-1.5.0-Setup.exe.sha256`
  - `release-attestation.json`
  - `release-attestation.json.bundle`

## Tag Move Record

The `v1.5.0` tag moved only under explicit user authorization and only before any v1.5.0 GitHub Release existed. No other tag was moved.

| Step | Target SHA | Reason |
| --- | --- | --- |
| Initial | `a0b1c467c43ebc84cfda25c7dab77d2d4d832292` | Product migration PR #69; release workflow had latent YAML parse failure. |
| Move 1 | `31ffd87db625006b0a0c5138bcf9e991c2cd11a2` | PR #70 fixed release-notes HEREDOC YAML parse error. |
| Move 2 | `fc93ab03ec3e0c85f617a0dd9f31dd32f086614c` | PR #71 split Linux compose verification from Windows installer build. |
| Move 3 | `917e4d5a4f703084097001b48638553b33137844` | PR #72 added container log dumps so the compose health failure became diagnosable. |
| Final | `f18922dc0612ae714cc69f302d3961007459ffe5` | PR #73 changed `FIRST_ADMIN_EMAIL` from `.local` to `admin@example.org`; release workflow passed and published v1.5.0. |

The product wheel content was unchanged across the workflow-only tag moves; the moves pulled release CI fixes into the source snapshot used by the tag-triggered workflow.

## Root Cause Of Ship Blockage

The v1.5.0 release exposed three pre-existing latent bugs in `civicrecords-ai/.github/workflows/release.yml` and its release gate path:

1. YAML parse error in the release-notes HEREDOC body, matching audit finding TEST-022.
2. Windows runner attempted to run Linux Docker Compose verification.
3. Hermetic `.env` used `FIRST_ADMIN_EMAIL=admin@ci.local`; `email-validator` rejects `.local` as a special-use/reserved name.

These were invisible until the v1.5.0 tag exercised the release workflow on a fresh runner.

## Permanent Improvements Landed

| PR | Merge SHA | Improvement |
| --- | --- | --- |
| CivicRecords AI #70 | `31ffd87db625006b0a0c5138bcf9e991c2cd11a2` | Fixed release-notes YAML parse failure by moving markdown body into a template. |
| CivicRecords AI #71 | `fc93ab03ec3e0c85f617a0dd9f31dd32f086614c` | Added Linux release verification job and kept Windows scoped to installer build. |
| CivicRecords AI #72 | `917e4d5a4f703084097001b48638553b33137844` | Added container log dump on compose health-check failure. |
| CivicRecords AI #73 | `f18922dc0612ae714cc69f302d3961007459ffe5` | Replaced `.local` admin email with `admin@example.org`. |
| CivicSuite #121 | `3cf9f8289f1090b1c6dd9270d7e184793870df2d` | Reconciled umbrella truth and re-enabled the full-suite installer profile. |

## Verification

`python scripts/verify-suite-state.py --remote-only` output after PR #121:

```text
==> CivicSuite suite-state verification
workspace: C:\Users\scott\OneDrive\Desktop\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.0.1 (CivicSuite/civiccore)
[civicrecords-ai] PASS 1.5.0 (CivicSuite/civicrecords-ai)
[civicclerk] PASS 1.0.1 (CivicSuite/civicclerk)
[civiccode] PASS 0.5.0 (CivicSuite/civiccode)
[civiczone] PASS 0.2.0 (CivicSuite/civiczone)
[civicaccess] PASS 0.1.1 (CivicSuite/civicaccess)
[civicplan] PASS 0.2.0 (CivicSuite/civicplan)
[civicpermit] PASS 0.2.0 (CivicSuite/civicpermit)
[civicinspect] PASS 0.2.0 (CivicSuite/civicinspect)
[civicgrants] PASS 0.2.0 (CivicSuite/civicgrants)
[civicprocure] PASS 0.2.0 (CivicSuite/civicprocure)
[civiccontracts] PASS 0.1.1 (CivicSuite/civiccontracts)
[civicboards] PASS 0.1.1 (CivicSuite/civicboards)
[civicnotice] PASS 0.1.1 (CivicSuite/civicnotice)
[civic311] PASS 0.1.1 (CivicSuite/civic311)
[civiccomms] PASS 0.1.1 (CivicSuite/civiccomms)
[civicdata] PASS 0.1.2 (CivicSuite/civicdata)
[civichr] PASS 0.1.1 (CivicSuite/civichr)
[civicbudget] PASS 0.1.2 (CivicSuite/civicbudget)
[civiclegal] PASS 0.1.2 (CivicSuite/civiclegal)
[civicelections] PASS 0.1.1 (CivicSuite/civicelections)
[civicutility] PASS 0.1.1 (CivicSuite/civicutility)
[civiccourt] PASS 0.1.2 (CivicSuite/civiccourt)
[civicsafety] PASS 0.1.1 (CivicSuite/civicsafety)
[civiclibrary] PASS 0.1.1 (CivicSuite/civiclibrary)
[civicparks] PASS 0.1.1 (CivicSuite/civicparks)
VERIFY-SUITE-STATE: PASSED
```

## Browser/UX Evidence

CivicRecords AI did not have a dedicated browser-QA harness for the requested walkthroughs. PR #69 documented the gap and used the existing Playwright e2e suite as the available substitute. The browser-QA gap remains open for a future UI evidence task; it did not block this dependency migration under the authorized directive.

## Open Work

1. Audit punch-list section B/C/D recovery: security defaults, install path, and module honesty.
2. Add `workflow_dispatch` to `civicrecords-ai/.github/workflows/release.yml` so future tag-triggered releases can be rerun without moving a tag.
3. Build a dedicated CivicRecords AI browser-QA harness that saves desktop/mobile screenshots for public intake, staff admin, audit verification, and search flows.

## Recommended Next Target

Recommendation: start audit punch-list section B/C/D recovery next, with `workflow_dispatch` as a small follow-up item inside the release-infrastructure lane.

Why: CivicRecords AI now shares CivicCore v1.0.1 with the rest of the active product/platform repos and the full-suite installer profile is re-enabled. The next highest-value work is closing the audit's remaining security/install/module-honesty gaps rather than reopening completed release plumbing.
