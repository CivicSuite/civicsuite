# Handoff: Demotion Batch Complete

Date: 2026-05-10

## Status

The false v1 demotion batch is complete and the umbrella truth surface has been reconciled.

Active next target: CivicCore v1.0.1 recovery patch.

## Umbrella PR

- PR: https://github.com/CivicSuite/civicsuite/pull/115
- Merge commit: `288b762aa72e6394c018a763b39d55fb9aa0026f`
- Merge timestamp: `2026-05-10T07:10:53Z`
- Title: `release: record demotion recovery truth (#115)`

Green CI checks recorded before merge:

- `verify` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622439316/job/75211812572
- `release-lockstep-gate` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622446226/job/75211465540
- `linux archive full lifecycle` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622439328/job/75211445023
- `linux archive readiness and plan` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622439328/job/75211445039
- `macos archive readiness and plan` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622439328/job/75211445047
- `windows archive readiness and plan` — pass — https://github.com/CivicSuite/civicsuite/actions/runs/25622439328/job/75211445038

## Replacement Releases

| Repo | Replacement | URL | Assets |
|---|---:|---|---|
| CivicSuite/civiccode | v0.5.0 | https://github.com/CivicSuite/civiccode/releases/tag/v0.5.0 | `civiccode-0.5.0-py3-none-any.whl`, `civiccode-0.5.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civiczone | v0.2.0 | https://github.com/CivicSuite/civiczone/releases/tag/v0.2.0 | `civiczone-0.2.0-py3-none-any.whl`, `civiczone-0.2.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civicplan | v0.2.0 | https://github.com/CivicSuite/civicplan/releases/tag/v0.2.0 | `civicplan-0.2.0-py3-none-any.whl`, `civicplan-0.2.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civicpermit | v0.2.0 | https://github.com/CivicSuite/civicpermit/releases/tag/v0.2.0 | `civicpermit-0.2.0-py3-none-any.whl`, `civicpermit-0.2.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civicinspect | v0.2.0 | https://github.com/CivicSuite/civicinspect/releases/tag/v0.2.0 | `civicinspect-0.2.0-py3-none-any.whl`, `civicinspect-0.2.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civicgrants | v0.2.0 | https://github.com/CivicSuite/civicgrants/releases/tag/v0.2.0 | `civicgrants-0.2.0-py3-none-any.whl`, `civicgrants-0.2.0.tar.gz`, `SHA256SUMS.txt` |
| CivicSuite/civicprocure | v0.2.0 | https://github.com/CivicSuite/civicprocure/releases/tag/v0.2.0 | `civicprocure-0.2.0-py3-none-any.whl`, `civicprocure-0.2.0.tar.gz`, `SHA256SUMS.txt` |

## Preserved Historical Tags

The false `v1.0.0` GitHub release pages were deleted, but the historical git tags were preserved. Do not delete or move these tags.

| Repo | Preserved tag | SHA |
|---|---|---|
| CivicSuite/civiccode | `v1.0.0` | `6dfd625cf895c6e0a9fc4038cc317adf58ce724c` |
| CivicSuite/civiczone | `v1.0.0` | `469a4cf81035aaa898d74a5e21326f8eadea21f4` |
| CivicSuite/civicplan | `v1.0.0` | `cb4bd6da7c66b14ae51eed8e635e49fa25e5674c` |
| CivicSuite/civicpermit | `v1.0.0` | `fce5dfe02b320a7bc750f61289c4664a91092ce1` |
| CivicSuite/civicinspect | `v1.0.0` | `d75f352dbda241f4f8cdf63e9c8535247abc45b3` |
| CivicSuite/civicgrants | `v1.0.0` | `60e80bba8a86299b2a88425ce5b1b4556b30857c` |
| CivicSuite/civicprocure | `v1.0.0` | `fc4d95f6bfd2f2cff1346116a4239a3f679e34ae` |

## Remote Suite Verification

Command:

```powershell
python scripts/verify-suite-state.py --remote-only
```

Output:

```text
==> CivicSuite suite-state verification
workspace: C:\dev\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.0.0 (CivicSuite/civiccore)
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

Note: the directive asked for all 24 modules. The current verifier enumerates 26 repos and all 26 pass; this handoff records the actual tool output.

## New Artifacts Shipped In PR #115

- `.github/workflows/release-lockstep-gate.yml`
- `scripts/verify-release-lockstep.py`
- `ARCHITECTURE.md`
- `FAQ.md`
- `STATUS.md`
- `docs/release-lockstep/downstream-pins.md`
- Updated `installer/modules.json`, including `full-suite` profile disabled until CivicRecords AI migrates to the current CivicCore line.

## Open Work After This Batch

Priority order:

1. CivicCore v1.0.1 recovery patch.
2. CivicClerk B1 security default fix and CivicClerk v1.0.1 recovery patch.
3. CivicRecords AI CivicCore v1.0 migration and v1.5.0 release.

## Caveat

CivicCore and CivicClerk main branches still lag their public v1.0 release tags. They were not part of the demotion batch. Their recovery is the next two sprints: CivicCore first, then CivicClerk after B1.

## Scope Boundary For Next Work

The next active target is CivicCore v1.0.1. The seven demoted releases are settled by PR #115 and must not be revisited, moved, retagged, or deleted.
