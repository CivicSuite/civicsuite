# Clerk-Core City Release Forensic Inventory

Date: 2026-05-18
Branch: `chore/clerk-core-city-release`
Head: `de3155c1a7752abccd07023f989ce231b55fc301`
Pipeline run: `.agent-runs/2026-05-18-clerk-core-city-release`
Pipeline version source: `agent-pipeline-codex` v0.9.0 plugin cache

## Gate Result

The forensic inventory gate is recorded for the Clerk-Core City Release target.
This inventory authorizes scoped starter-product work only. It does not
authorize queued-module implementation, v1.0.0 promotion, tag creation, release
creation, force-push, or history rewrite.

## Live GitHub State

Live org read command:

```text
gh repo list CivicSuite --limit 100 --json name,isPrivate,isArchived,defaultBranchRef,updatedAt,pushedAt,url,description
```

Visible CivicSuite org repos: 27 public, non-archived repos.

- Umbrella: `CivicSuite/civicsuite`, default branch `main`, pushed
  `2026-05-18T18:19:49Z`.
- Starter repos: `CivicSuite/civiccore`, `CivicSuite/civicrecords-ai`,
  `CivicSuite/civicclerk`.
- Queued/runtime repos visible: `civiccode`, `civiczone`, `civicaccess`,
  `civicplan`, `civicpermit`, `civicinspect`, `civicgrants`, `civicprocure`,
  `civiccontracts`, `civicboards`, `civicnotice`, `civic311`, `civiccomms`,
  `civicdata`, `civichr`, `civicbudget`, `civiclegal`, `civicelections`,
  `civicutility`, `civiccourt`, `civicsafety`, `civiclibrary`, `civicparks`.

Spec-named planned repos not visible in the live org:

- `CivicRegWatch`
- `CivicAPI`

## Starter Release Truth

Live release reads:

- `CivicSuite/civiccore` `v1.1.0`: published 2026-05-11, not prerelease,
  includes wheel, sdist, `SHA256SUMS.txt`, and attestation assets. Wheel digest:
  `sha256:3ab146f4fea2ae99640d5b1b013be1a9676de5f91b783eaeaa913043a2ae2b87`.
- `CivicSuite/civicrecords-ai` `v1.6.1`: published 2026-05-15, not prerelease,
  includes Windows setup exe, setup checksum, and attestation assets. Setup
  digest: `sha256:7846bb1d6c6286eecc3b1d2743cd2e2b8c258cb7d2eae6a050e383e3206a66d3`.
- `CivicSuite/civicclerk` `v1.0.1`: published 2026-05-10, not prerelease,
  includes wheel, sdist, and `SHA256SUMS.txt`. Wheel digest:
  `sha256:e6d9fd34406c1bad74c3400f1a32ae9f4d883bcf455f9c6a05f171d8869b76a7`.

## PR And CI State

Live PR read:

- PR: `https://github.com/CivicSuite/civicsuite/pull/147`
- State: open, non-draft, mergeable
- Head: `de3155c1a7752abccd07023f989ce231b55fc301`
- Label: `release-tag`

Latest PR-head CI:

- `verify` run `26052085935`: success. Log proof includes
  `[civicrecords-ai] PASS 1.6.1`, `[planned-spec-modules] PASS
  civicregwatch,civicapi`, and `VERIFY-SUITE-STATE: PASSED`.
- `release-lockstep-gate` run `26052085921`: success. Log proof includes
  `RELEASE-LOCKSTEP-GATE: PASSED`.
- `installer-cleanroom` run `26052085934`: success. Jobs include Linux archive
  full lifecycle plus Windows/macOS archive readiness and plan.

MacOS caveat: the macOS job is archive/readiness only. It is not macOS lifecycle
certification.

## Local Workspace State

Local implementation worktree:

- Path: `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-clerk-core-city-release`
- Branch: `chore/clerk-core-city-release`
- Status: clean at PR head `de3155c1a7752abccd07023f989ce231b55fc301`

Other local CivicSuite clones are not truth sources for this target:

- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite`: dirty generated
  installer artifacts and old branch state.
- `C:\Users\scott\OneDrive\Desktop\Claude\CivicSuite-live-main`: detached at
  `ebfa28f5665ef3fe35f6f69dcdd34285b6b3dbcd` with dirty generated installer
  artifacts.
- `C:\Users\scott\OneDrive\Desktop\Claude\civicrecords-ai`: has untracked
  temporary browser QA folders.

## Spec Inventory

`docs/CivicSuiteUnifiedSpec.md` heading inventory currently shows 28 module
headings total:

1. CivicCore
2. CivicRecords
3. CivicClerk
4. CivicCode
5. CivicAccess
6. CivicZone
7. CivicPlan
8. CivicPermit
9. CivicInspect
10. CivicGrants
11. CivicProcure
12. CivicContracts
13. CivicBoards
14. CivicNotice
15. Civic311
16. CivicComms
17. CivicData
18. CivicRegWatch
19. CivicAPI
20. CivicHR
21. CivicBudget
22. CivicLegal
23. CivicElections
24. CivicUtility
25. CivicCourt
26. CivicSafety
27. CivicLibrary
28. CivicParks

Drift to keep explicit: the roadmap/control text says "28 product modules plus
CivicCore," while the visible `####` heading inventory is CivicCore plus 27
product headings. Do not invent a missing product name; resolve the spec count
explicitly before freezing the post-starter module queue.

## Installer Inventory

`installer/modules.json` contains:

- 5 profiles
- 28 modules
- 25 selectable modules
- planned non-selectable spec modules: `civicregwatch`, `civicapi`

Profiles:

- `minimal`: `civiccore`
- `clerk-core`: `civiccore`, `civicrecords-ai`, `civicclerk`
- `land-use`: `civiccore`, `civiccode`, `civiczone`, `civicplan`,
  `civicpermit`, `civicinspect`
- `full-suite`: includes all installer-tracked modules including planned
  `civicregwatch` and `civicapi`
- `custom`: operator-selected selectable modules

Starter compatibility truth:

- CivicCore current platform release: `1.1.0`.
- CivicRecords AI current module release: `1.6.1`, CivicCore requirement
  `1.0.1`.
- CivicClerk current module release: `1.0.1`, CivicCore requirement `1.0.1`.

This is an explicit compatibility lane. It is not proof that the starter product
is city-deployable.

## Durable Docs Read

Read or inspected in this gate:

- `.agent-workflows/PROJECT_CONTROL_PLANE.md`
- `.agent-workflows/ACTIVE_WORK_QUEUE.md`
- `.agent-workflows/HANDOFF_2026-05-12_B2_COMPLETE.md` and latest handoff list
- `CHANGELOG.md`
- `README.md`
- `STATUS.md`
- `docs/CivicSuiteUnifiedSpec.md`
- `docs/release-recovery-status.md`
- `docs/release-lockstep/downstream-pins.md`
- `installer/modules.json`
- `installer/README.md`
- `docs/installer/starter-set-release-contract.md`
- `C:\Users\scott\OneDrive\Desktop\Claude\audit-civicsuite-2026-05-09\sprint-punchlist.md`

## Release Claims Check

Current-facing docs correctly avoid claiming:

- full-suite city readiness
- procurement readiness
- airgap certification
- macOS lifecycle certification
- queued module completion

Allowed current claim: Linux-first clerk-core beta lifecycle and package
readiness evidence. Required caveat: the starter product is still RED until the
full install/start/health/repair/backup/restore/uninstall proof, runtime
workflow proof, browser QA, docs, tests, and release truth pass together.

## Immediate Product Gaps

Blockers for the city-deployable starter product:

1. Installer lifecycle does not yet expose or verify `backup` and `restore`
   modes.
2. Linux lifecycle CI currently proves install/repair/verify/uninstall, not the
   full install/start/health/repair/backup/restore/uninstall sequence.
3. Runtime workflow proof is still thin: CivicRecords request/fetch and
   CivicClerk agenda intake/list are checked, but full request/search/review/
   response and agenda/packet/minutes/vote/notice/archive workflows remain
   unproven inside the installed stack.
4. Desktop/mobile browser QA for the installed public and staff paths is not
   recorded for this starter target.
5. Spec count drift remains unresolved for the post-starter queue.

## Authorized Next Slice

Implement the installer lifecycle completion slice inside the umbrella repo:

- Add `backup` and `restore` lifecycle modes.
- Make package cleanroom run backup/restore between verify and uninstall.
- Update generated package launcher help and README text.
- Update installer verification to require backup/restore in matching-host
  lifecycle evidence.
- Do not touch queued module repos.
