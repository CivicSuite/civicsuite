# Handoff: CivicCore v1.0.1 Pin Sweep Complete

Date: 2026-05-10

Scope: CivicCore v1.0.1 release-truth recovery, eight downstream CivicCore pin bumps, CivicSuite umbrella reconciliation, post-merge remote verification, and queue update.

Completion status: GREEN.

## CivicCore Release

- Release URL: https://github.com/CivicSuite/civiccore/releases/tag/v1.0.1
- Published: 2026-05-10T07:47:19Z
- Wheel: `civiccore-1.0.1-py3-none-any.whl`
- Wheel SHA256: `561d7a8f73260d50de79351d330876d2cb3488c0e046a2888e82fe09d1e03969`
- Source distribution: `civiccore-1.0.1.tar.gz`
- Source distribution SHA256: `fc734c528826f347e6f73677c3e629b07a97cc41430f2c173a0c411d3b6bbe41`
- SHA256SUMS asset SHA256: `522bade5ade21bceda45e8a22bfe36c201c80afb11f695129ae11e80d7387168`

## Downstream Pin PRs

| Repo | PR | Merge SHA |
|---|---:|---|
| CivicSuite/civicinspect | #8 | `6b31f80` |
| CivicSuite/civiczone | #17 | `71ded10` |
| CivicSuite/civicgrants | #7 | `36f514e` |
| CivicSuite/civicprocure | #7 | `63f4264` |
| CivicSuite/civiccode | #54 | `5979ca2` |
| CivicSuite/civicplan | #9 | `4b8f2dd1b12447ad645bd78a2ea65f1f92329eac` |
| CivicSuite/civicpermit | #10 | `4d1056dd1227ffe60cef461779a46c2e1f15c5fa` |
| CivicSuite/civicclerk | #155 | `ccc9a158ab49f1f163d030aba21d9d7e9af20e7a` |

## Umbrella PR

- PR: https://github.com/CivicSuite/civicsuite/pull/116
- Title: `chore: civiccore v1.0.1 suite-truth reconciliation`
- Merge SHA: `82f4b51e89d12e8d6d9a5da10af80168cee18900`
- Merged at: 2026-05-10T10:42:15Z
- Required checks: green.
- `release-lockstep-gate`: passed.

## Post-Merge Verification

Command:

```text
python scripts/verify-suite-state.py --remote-only
```

Output:

```text
==> CivicSuite suite-state verification
workspace: C:\Users\scott\OneDrive\Desktop\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.0.1 (CivicSuite/civiccore)
[civicrecords-ai] PASS 1.4.10 (CivicSuite/civicrecords-ai)
[civicclerk] PASS 1.0.0 (CivicSuite/civicclerk)
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

## Notes

- CivicRecords AI was not touched and remains pinned to CivicCore `0.22.1`; its CivicCore migration is a separate v1.5.0 sprint.
- CivicCore source and release artifacts were not changed during the umbrella sweep; v1.0.1 was already final.
- The seven demoted releases from PR #115 were not moved, retagged, yanked again, or modified.
- CivicClerk remains version `1.0.0`; only its CivicCore dependency pin moved to `1.0.1`. CivicClerk v1.0.1 still requires the B1 secure-default fix.

## Caveats / Frozen Evidence

Frozen evidence was not retroactively rewritten. This includes dated audit files, QA evidence, release-recovery historical statements, compatibility history rows, and older changelog entries that describe what was true at the time.

Known historical references left intact:

- Compatibility history rows for CivicCore 1.0.0 and CivicClerk 1.0.0.
- Prior demotion-batch downstream pin records showing CivicCore 1.0.0 at that earlier point in the recovery.
- Audit and QA evidence from before the v1.0.1 pin sweep.

## Open Work In Priority Order

1. CivicClerk B1 security fix: default/open mode must become protected before CivicClerk can receive a v1.0.1 recovery patch.
2. CivicRecords AI to CivicCore v1.0.1 migration and v1.5.0 release.
3. Audit punch-list section B: security defaults.
4. Audit punch-list section C: install path.
5. Audit punch-list section D: module honesty.

## Recommendation

Recommendation: start the next work session with CivicClerk B1.

Why: CivicClerk is the next real product-shaped module, but the audit-verified anonymous-write default is a trust blocker. Fixing that before any other productization work keeps the recovery sequence honest and prevents another false release label.
