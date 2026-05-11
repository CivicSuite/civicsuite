# CivicSuite Handoff - D2/B3 Staff Key Gate Complete

Date: 2026-05-11

Status: GREEN

Scope: audit punch-list D2 + B3 recovery. Extract a shared CivicCore staff-key helper, release CivicCore v1.1.0, and roll the helper/pin through the six downstream modules that carried bespoke staff-key or pin surfaces in this sprint: CivicCode, CivicPlan, CivicPermit, CivicInspect, CivicGrants, and CivicProcure.

## Completion Summary

- Phase 0 infrastructure preflight completed and recorded in `.agent-runs/2026-05-11-d2-b3-staff-key-gate/phase0-report.md`.
- CivicCore PR #55 fixed release-verification infrastructure so the local release gate is self-diagnosing and installs its own dev dependencies in a temporary environment.
- CivicCore PR #56 added `civiccore.auth.staff_key_gate`, exported it from `civiccore.auth`, tested missing-env, wrong-key, wrong-role, valid-path, and timing-safe comparison behavior, and bumped CivicCore to v1.1.0.
- CivicCore v1.1.0 release published with wheel, sdist, SHA256SUMS, and attestation assets.
- Six downstream PRs merged with green module CI.
- CivicSuite umbrella PR #123 reconciled spec, verifier, compatibility, installer metadata, downstream pin ledger, changelog, and release-recovery status through green `release-lockstep-gate`.
- `python scripts/verify-suite-state.py --remote-only` passes for all 26 repos after the umbrella reconciliation.

## CivicCore v1.1.0 Release

Release: https://github.com/CivicSuite/civiccore/releases/tag/v1.1.0

| Asset | SHA256 |
|---|---|
| `civiccore-1.1.0-py3-none-any.whl` | `3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87` |
| `civiccore-1.1.0.tar.gz` | `5aaee6aacad99a1ad349e7de27000d9c9b919c5dbb9f041fe2da8149c4e505ad` |
| `SHA256SUMS.txt` | `9676da0e4f64b742c92b33c8ba9505818f6193f4afdf87fc9a42c707317bcab2` |
| `release-attestation.json` | `f301769a147fc28d52c202efa2409cd849cc5d00bb9ddc3b1cac337ce75fda7c` |
| `release-attestation.json.bundle` | `0a1f854434b16866e30f4af8044997bd1db69321a3239f8ec12bb7c88742d5de` |

## Tag-Move Record

| Tag | Initial SHA | Final SHA | Moves | Notes |
|---|---|---|---:|---|
| `v1.1.0` | `411a4f4a833c91a787dacf1485f643f564e174c2` | `411a4f4a833c91a787dacf1485f643f564e174c2` | 0 | Phase 2 local rehearsal passed before tag push; no tag correction was needed. |

## Merged PRs

| Repo | PR | Merge SHA | Evidence |
|---|---:|---|---|
| CivicSuite/civiccore | #55 | `7a176a0deda7cce849cc648b15469e3b3af0de72` | Phase 0 release-gate infrastructure fix. |
| CivicSuite/civiccore | #56 | `411a4f4a833c91a787dacf1485f643f564e174c2` | `staff_key_gate` helper, tests, v1.1.0 version bump. |
| CivicSuite/civiccode | #55 | `b142425f1d90091514571461c19a0545413d206e` | CivicCore v1.1.0 pin and workflow/test/doc surfaces. |
| CivicSuite/civicplan | #10 | `0049da9c20c2040e5dad772f366b5628afd2ac5a` | CivicCore v1.1.0 pin and shared staff-key gate. |
| CivicSuite/civicpermit | #11 | `9b3db542a45f1c357e8ff820c6a9c99920fd5b3f` | CivicCore v1.1.0 pin and shared staff-key gate. |
| CivicSuite/civicinspect | #9 | `a815ee798632fa00a310bfb4e8fb0fc975481bba` | CivicCore v1.1.0 pin and shared staff-key gate. |
| CivicSuite/civicgrants | #8 | `5b01d8c6b9c2952591b28f2c5f09039382d4573a` | CivicCore v1.1.0 pin and shared staff-key gate. |
| CivicSuite/civicprocure | #8 | `5836032f396cb901769e9f2ff7a168e30aefb2f6` | CivicCore v1.1.0 pin and shared staff-key gate. |
| CivicSuite/civicsuite | #123 | `63528de` | Suite-truth reconciliation through green `release-lockstep-gate`. |

## Verification Evidence

Local CivicCore release rehearsal:

```text
bash scripts/verify-release.sh
VERIFY-RELEASE: PASSED
```

Local umbrella verification before PR #123:

```text
python scripts/verify-suite-state.py
VERIFY-SUITE-STATE: PASSED

python scripts/verify-suite-state.py --remote-only
VERIFY-SUITE-STATE: PASSED
```

Post-umbrella remote verification:

```text
==> CivicSuite suite-state verification
workspace: C:\Users\scott\OneDrive\Desktop\Claude
repos: 26
remote release checks: enabled
local sibling clone checks: disabled
[civiccore] PASS 1.1.0 (CivicSuite/civiccore)
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

## Scope Notes

- CivicRecords AI, CivicClerk, and CivicZone remain on CivicCore v1.0.1. They were outside the authorized D2/B3 staff-key rollout.
- CivicCode consumes CivicCore v1.1.0 but did not need a staff-key replacement because it already used CivicCore trusted-header auth instead of a bespoke staff-key comparison.
- CivicPlan added a staff-key requirement for staff ingest paths as part of replacing role-only staff access with the shared helper.
- In modules adopting `staff_key_gate`, the shared helper permits the `staff` role. Earlier docs that mentioned `service` as an accepted staff-key role were updated in-module where applicable.
- Local `scripts/verify-installer-plan.py` hung in this Windows workspace when run end-to-end because it invokes generated launcher flows; the GitHub `verify` job ran the same verifier successfully after PR #123's stale 1.0.1 expectations were updated. The suite-state verifier passed locally and remotely.

## Process Caveat

PR #123's feature branch was force-updated once with `--force-with-lease` after adding the stale installer-plan verifier fix. No protected branch, release tag, release artifact, or module history was rewritten. This is recorded here because the preferred pattern is follow-up commits on PR branches unless a sprint directive explicitly permits branch rewriting.

## Open Work After This Sweep

1. Audit punch-list B2: move JWT secret and first admin password out of container env into Docker secrets or bind-mounted secret files.
2. Audit punch-list C4: decide the macOS runner strategy or narrow the supported platform claim.
3. Audit punch-list C6: air-gap install path with bundled CivicCore wheels and `--no-index --find-links`.
4. Audit punch-list D1/D3/D4/D5/D6: module honesty and runtime-depth recovery, one bounded scope at a time.

