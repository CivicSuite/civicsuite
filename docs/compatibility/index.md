# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source - when a row changes, this is the canonical
record.

| Module          | Repo                           | Current version | Released   | Compatible CivicCore range | Last verified | Notes |
|-----------------|--------------------------------|-----------------|------------|----------------------------|---------------|-------|
| civiccore       | CivicSuite/civiccore           | 0.11.0          | 2026-04-29 | n/a                        | 2026-04-29    | Shared platform release adding onboarding profile helpers plus permission-aware search/access helpers on top of the earlier auth, notice, connector, export, and provenance surface. |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.1           | 2026-04-28 | `==0.10.0`                 | 2026-04-29    | Mainline records-ai backend currently pins the published `civiccore v0.10.0` wheel for the onboarding helper rollout. |
| civicclerk      | CivicSuite/civicclerk          | 0.1.4           | 2026-04-29 | `==0.11.0`                 | 2026-04-29    | Productizing clerk release line now consumes `civiccore v0.11.0` for shared notice plus permission-aware search/access helpers. |
| civiccode       | CivicSuite/civiccode           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: first runtime surface preserved while moving to civiccore 0.3.0 shared primitives. |
| civiczone       | CivicSuite/civiczone           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: parcel-aware zoning runtime foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicaccess     | CivicSuite/civicaccess         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: accessibility foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicplan       | CivicSuite/civicplan           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: planning policy foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicpermit     | CivicSuite/civicpermit         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: permit intake foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicinspect    | CivicSuite/civicinspect        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: inspection support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicgrants     | CivicSuite/civicgrants         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: grant support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicprocure    | CivicSuite/civicprocure        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: procurement support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiccontracts  | CivicSuite/civiccontracts      | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: contract repository foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicboards     | CivicSuite/civicboards         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: board administration foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicnotice     | CivicSuite/civicnotice         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: public notice compliance foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civic311        | CivicSuite/civic311            | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: resident service request foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiccomms      | CivicSuite/civiccomms          | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: public communications foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicdata       | CivicSuite/civicdata           | 0.1.2           | 2026-04-29 | `==0.4.0`                  | 2026-04-29    | Auth-protected persisted retrieval rollout consumes the published `civiccore v0.4.0` release. |
| civichr         | CivicSuite/civichr             | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: HR policy support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicbudget     | CivicSuite/civicbudget         | 0.1.2           | 2026-04-29 | `==0.4.0`                  | 2026-04-29    | Auth-protected persisted retrieval rollout consumes the published `civiccore v0.4.0` release. |
| civiclegal      | CivicSuite/civiclegal          | 0.1.2           | 2026-04-29 | `==0.11.0`                 | 2026-04-29    | Privilege-aware search/access filtering now consumes the published `civiccore v0.11.0` release wheel. |
| civicelections  | CivicSuite/civicelections      | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: election administration support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicutility    | CivicSuite/civicutility        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: utility support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiccourt      | CivicSuite/civiccourt          | 0.1.2           | 2026-04-29 | `==0.4.0`                  | 2026-04-29    | Auth-protected persisted retrieval rollout consumes the published `civiccore v0.4.0` release. |
| civicsafety     | CivicSuite/civicsafety         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: public-safety administrative support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiclibrary    | CivicSuite/civiclibrary        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: library support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicparks      | CivicSuite/civicparks          | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: parks and recreation support foundation preserved while moving to civiccore 0.3.0 shared primitives. |

## Reading a row

`civicrecords-ai 1.4.1 ... ==0.10.0` means: records-ai version 1.4.1 requires
exactly civiccore 0.10.0. Mixing other civiccore versions with that
records-ai release produces undefined behavior. The `civiccore` row records
the latest platform release; module rows record the exact pins those module
release lines actually ship with.

## Tested pairs (history)

| Date       | civiccore | Module / version       | Result | Evidence |
|------------|-----------|------------------------|--------|----------|
| 2026-04-29 | 0.11.0    | civicclerk 0.1.4       | green  | civiccore PR #22 merged and v0.11.0 assets published; civicclerk PR #38 merged at 79d9b3b; PR #39 fixed CI wheel-pin drift; verify-release.sh PASSED post-merge |
| 2026-04-29 | 0.11.0    | civiclegal 0.1.2       | green  | civiclegal PR #4 merged at 09ce3b8; PR #5 fixed workflow wheel-pin drift; verify-release.sh PASSED post-merge |
| 2026-04-29 | 0.10.0    | civicrecords-ai 1.4.1  | green  | records-ai PR #51 merged at fa0ef0c; onboarding helper rollout verified against published civiccore v0.10.0 wheel |
| 2026-04-29 | 0.4.0     | civicbudget 0.1.2      | green  | civicbudget PR #4 merged; auth rollout verified against published civiccore v0.4.0 release |
| 2026-04-29 | 0.4.0     | civiccourt 0.1.2       | green  | civiccourt PR #4 merged at bc8f0e4; verify-release.sh PASSED post-merge |
| 2026-04-29 | 0.4.0     | civicdata 0.1.2        | green  | civicdata PR #5 merged at 5d8378d; verify-release.sh PASSED post-merge |
| 2026-04-28 | 0.3.0     | civicrecords-ai 1.4.1  | green  | civicrecords-ai PR #48 merged at ac71f61; release workflow run 25071324131; v1.4.1 installer assets published; verify-release.sh PASSED |
| 2026-04-28 | 0.3.0     | civicclerk 0.1.1       | green  | civicclerk PR #29 merged at 7d54d30; 382 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civiccore 0.3.0        | green  | civiccore release workflow run 25037429110; PR #14; 122 tests passed; release assets published |
| 2026-04-27 | 0.2.0     | civicclerk 0.1.0       | green  | civicclerk release workflow run 24975592931; CivicClerk v0.1.0 published with civiccore 0.2.0 wheel |
| 2026-04-25 | 0.2.0     | civicrecords-ai 1.4.0  | green  | records-ai release workflow run 24943570795; CivicRecords AI v1.4.0 published with civiccore 0.2.0 wheel |

## Update policy

- Updated every time a module ships a new version that changes its civiccore pin.
- Updated every time civiccore ships a new MINOR or MAJOR.
- When a row changes, also update `CONSISTENCY.md` if any number listed there moves.
