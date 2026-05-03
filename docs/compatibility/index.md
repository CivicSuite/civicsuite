# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source - when a row changes, this is the canonical
record.

| Module          | Repo                           | Current version | Released   | Compatible CivicCore range | Last verified | Notes |
|-----------------|--------------------------------|-----------------|------------|----------------------------|---------------|-------|
| civiccore       | CivicSuite/civiccore           | 0.21.0          | 2026-05-02 | n/a                        | 2026-05-03    | Shared platform release line now includes reusable vendor-delta planning, mock-city vendor/municipal IdP/backup-retention contracts, startup configuration validation helpers, live-sync retry/circuit primitives, persisted audit-log hash/verification helpers, connector import helpers, browser-evidence verification helpers, shared search/access helpers, trusted-header config loading, proxy-source enforcement helpers, and shared cron/schedule validation helpers. |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.8           | 2026-05-02 | `==0.21.0`                 | 2026-05-03    | Published records-ai release consumes the published `civiccore v0.21.0` wheel for shared schedule validation plus startup configuration validation, vendor-delta and mock-city contracts, live-sync retry/circuit primitives, persisted audit-log hashing and verification, shared search, onboarding, connector-security, and ingest contracts. |
| civicclerk      | CivicSuite/civicclerk          | 0.1.19          | 2026-05-03 | `==0.21.0`                 | 2026-05-03    | Productizing clerk release consumes the published `civiccore v0.21.0` wheel for shared startup placeholder/config validation while retaining CivicClerk-specific OIDC browser flow behavior. It includes the React staff/public product rehearsal, Docker Compose seeded demo, OIDC browser-session foundation, Docker/PostgreSQL backup/restore rehearsal, vendor-network live sync, reusable mock municipal IdP and backup-retention contract suites, scheduled local connector import sync, installer source packaging, explicit unsigned-installer warnings, and enterprise signing readiness. |
| civicregwatch   | CivicSuite/civicregwatch       | planned         | not released | TBD                      | 2026-04-30    | New planned federal regulatory intelligence module. Implementation spec exists in `specs/05_civicregwatch.md`; repo and civiccore pin are not scaffolded yet. |
| civicapi        | CivicSuite/civicapi            | planned         | not released | TBD                      | 2026-04-30    | New planned public read-only data gateway module. Implementation spec exists in `specs/06_civicapi.md`; repo and civiccore pin are not scaffolded yet. |
| civiccode       | CivicSuite/civiccode           | 0.1.6           | 2026-05-03 | `==0.21.0`                 | 2026-05-03    | Active municipal-code productization release: source-registry persistence, staff-header-protected source registry operations, the staff source registry workspace, the staff code lifecycle workspace, and reusable mock-city codifier contracts are published while the module consumes the published `civiccore v0.21.0` wheel. |
| civiczone       | CivicSuite/civiczone           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: parcel-aware zoning runtime foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicaccess     | CivicSuite/civicaccess         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: accessibility foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicplan       | CivicSuite/civicplan           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: planning policy foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicpermit     | CivicSuite/civicpermit         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: permit intake foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicinspect    | CivicSuite/civicinspect        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: inspection support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicgrants     | CivicSuite/civicgrants         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: grant support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicprocure    | CivicSuite/civicprocure        | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: procurement support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiccontracts  | CivicSuite/civiccontracts      | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: contract repository foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicboards     | CivicSuite/civicboards         | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: board administration foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicnotice     | CivicSuite/civicnotice         | 0.1.2 local / 0.1.1 published | 2026-04-28 | `==0.9.0` local / `==0.3.0` published | 2026-04-30    | Current local notice line consumes `civiccore v0.9.0`; latest GitHub release remains `v0.1.1` on `==0.3.0`. |
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

`civicnotice 0.1.2 local / 0.1.1 published` means: the local sibling clone
currently reports version 0.1.2, while the latest published GitHub release is
0.1.1. The same local/published split applies to CivicCore pins. Mixing other
civiccore versions with a module release produces undefined behavior. The
`civiccore` row records the latest platform release; module rows record exact
local and published pins when they differ.

## Tested pairs (history)

| Date       | civiccore | Module / version       | Result | Evidence |
|------------|-----------|------------------------|--------|----------|
| 2026-05-03 | 0.21.0    | civiccode 0.1.6        | green  | civiccode PR #29 merged at 4dc0997; `bash scripts/verify-release.sh` passed post-merge with 121 tests, docs gate, placeholder import gate, Ruff, build artifact checks, and SHA256SUMS; main CI run 25271238231 passed; GitHub release `v0.1.6` published wheel, sdist, and SHA256SUMS assets |
| 2026-05-03 | 0.21.0    | civicclerk 0.1.19      | green  | civicclerk PR #137 merged at e261b43; `bash scripts/verify-release.sh` passed post-merge with 539 backend tests, docs, browser QA, prompt evals, frontend audit/build/tests, package build, checksums, and release contract; main CI run 25270758909 passed; release workflow run 25270834580 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.21.0    | civicrecords-ai 1.4.8  | green  | civicrecords-ai PR #59 and PR #60 merged through f20e3e7; release `v1.4.8` published with unsigned Windows installer assets while consuming CivicCore v0.21.0 shared scheduling helpers |
| 2026-05-02 | 0.21.0    | civiccore 0.21.0       | green  | civiccore PR #34 merged at 4a1eb71; release `v0.21.0` published wheel, sdist, and SHA256SUMS assets for shared scheduling helpers |
| 2026-05-02 | 0.20.0    | civicclerk 0.1.18      | green  | civicclerk PR #136 merged at fe7ddc4; `bash scripts/verify-release.sh` passed with 539 backend tests, docs, browser QA, prompt evals, frontend audit/build/tests, package build, checksums, and release contract; main CI run 25256065842 passed; release workflow run 25256107238 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.20.0    | civicrecords-ai 1.4.7  | green  | civicrecords-ai PR #58 merged at 884cf5c; `bash scripts/verify-release.sh` passed; master CI run 25255230035 passed; GitHub release `v1.4.7` published unsigned Windows installer and checksum assets while consuming CivicCore v0.20.0 shared startup config validation |
| 2026-05-02 | 0.20.0    | civiccore 0.20.0       | green  | civiccore PR #33 merged at ad66681; `bash scripts/verify-release.sh` passed with 238 tests and fresh venv install verification; main CI run 25254779253 passed; release workflow run 25254819041 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.19.0    | civiccode 0.1.5        | green  | civiccode PR #28 merged at 22d1602; `bash scripts/verify-release.sh` passed with 115 tests, docs gate, placeholder import gate, Ruff, and build artifact checks; main CI run 25252849777 passed; GitHub release `v0.1.5` published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.19.0    | civicclerk 0.1.17      | green  | civicclerk PR #134 merged at 94f43ce; PR #135 fixed CI CivicCore wheel-pin drift at 5b6e28e; `bash scripts/verify-release.sh` passed; main CI run 25251247832 passed; release workflow run 25251278443 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.19.0    | civicrecords-ai 1.4.6  | green  | civicrecords-ai PR #57 merged at decab6a; `bash scripts/verify-release.sh` passed; master CI run 25250635852 passed; GitHub release `v1.4.6` published unsigned Windows installer and checksum assets while consuming CivicCore v0.19.0 shared contracts |
| 2026-05-02 | 0.18.1    | civicclerk 0.1.16      | green  | civicclerk PR #133 merged at c4455a3; `bash scripts/verify-release.sh` passed; main CI run 25249364936 passed; release workflow run 25249394980 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-02 | 0.18.1    | civicrecords-ai 1.4.5  | green  | civicrecords-ai PR #55 merged at 1bd3d1c; `bash scripts/verify-release.sh` passed; master CI run 25246593265 passed; GitHub release `v1.4.5` published unsigned Windows installer and checksum assets while consuming shared CivicCore sync primitives |
| 2026-05-02 | 0.18.1    | civicclerk 0.1.15      | green  | civicclerk PR #126 and PR #127 merged; main at 0792db7; `bash scripts/verify-release.sh` passed; main CI run 25247765134 passed; release workflow run 25247799821 published wheel, sdist, and SHA256SUMS assets |
| 2026-05-01 | 0.17.0    | civicrecords-ai 1.4.4  | green  | civicrecords-ai PR #54 merged at 1a7d2c0; `bash scripts/verify-release.sh` passed; master CI run 25238649491 passed; GitHub release `v1.4.4` published unsigned Windows installer and checksum assets |
| 2026-05-01 | 0.17.0    | civicclerk 0.1.13      | green  | civicclerk main at 77599cb; PR #108 merged; `bash scripts/verify-release.sh` passed; GitHub release `v0.1.13` published wheel, sdist, and SHA256SUMS assets |
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
