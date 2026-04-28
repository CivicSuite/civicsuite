# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source — when a row changes, this is the canonical
record.

| Module          | Repo                              | Current version | Released   | Compatible CivicCore range | Last verified | Notes                                                                                          |
|-----------------|-----------------------------------|-----------------|------------|----------------------------|---------------|------------------------------------------------------------------------------------------------|
| civiccore       | CivicSuite/civiccore              | 0.3.0           | 2026-04-28 | n/a                        | 2026-04-28    | Shared primitives release: audit, provenance, manifests, exports, and city profile configuration. Backward-compatible with current 0.2.x consumers. |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.0           | 2026-04-25 | `==0.2.0`                  | 2026-04-26    | Phase 2 LLM integration; depends on the exact `==0.2.0` civiccore wheel. Transferred to the CivicSuite org on 2026-04-25. |
| civicclerk      | CivicSuite/civicclerk             | 0.1.0           | 2026-04-27 | `==0.3.0`                  | 2026-04-28    | Current main: runtime foundation plus post-release live `/staff` workflow screens for intake, packet export, notice, outcomes, minutes, archive, and connector import. Published v0.1.0 tag was originally cut on 2026-04-27. |
| civiccode       | CivicSuite/civiccode              | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: first runtime surface preserved while moving to civiccore 0.3.0 shared primitives. |
| civiczone       | CivicSuite/civiczone              | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: parcel-aware zoning runtime foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicaccess     | CivicSuite/civicaccess            | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: accessibility foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicplan       | CivicSuite/civicplan              | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: planning policy foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicpermit     | CivicSuite/civicpermit            | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: permit intake foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicinspect    | CivicSuite/civicinspect           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: inspection support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicgrants     | CivicSuite/civicgrants            | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: grant support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civicprocure    | CivicSuite/civicprocure           | 0.1.1           | 2026-04-28 | `==0.3.0`                  | 2026-04-28    | Dependency-alignment release: procurement support foundation preserved while moving to civiccore 0.3.0 shared primitives. |
| civiccontracts  | CivicSuite/civiccontracts         | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: contract registry, clause topic lookup, expiration tracking, renewal visibility helper, public-records export checklist, and accessible public UI foundation. |
| civicboards     | CivicSuite/civicboards            | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: board registry, term review plans, vacancy checklists, attendance summaries, notice/records export checklist, and accessible public UI foundation. |
| civicnotice     | CivicSuite/civicnotice            | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: notice registry, statutory deadline plans, publication-readiness checklists, channel planning, notice/records export checklist, and accessible public UI foundation. |
| civic311        | CivicSuite/civic311               | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: resident service request intake, deterministic triage, duplicate-candidate review, department routing checklist, Open311-compatible export helper, and accessible public UI foundation. |
| civiccomms      | CivicSuite/civiccomms             | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: source-readiness review, meeting summary drafts, ordinance explainers, newsletter scaffolds, FAQ prompts, audience variants, and accessible public UI foundation. |
| civicdata       | CivicSuite/civicdata              | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: dataset normalization, data-dictionary drafts, CKAN metadata drafts, PII/exemption preflight, archive-bundle checklists, publication planning, and accessible public UI foundation. |
| civichr         | CivicSuite/civichr                | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: HR policy lookup outlines, handbook summaries, job-description drafts, classification references, onboarding/training checklists, intake templates, source review, sensitive-topic preflight, and accessible public UI foundation. |
| civicbudget     | CivicSuite/civicbudget            | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: line-item variance analysis, budget narrative drafts, department memo drafts, hearing packet checklists, resident summaries, optional GFOA checklist support, and accessible public UI foundation. |
| civiclegal      | CivicSuite/civiclegal             | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: privilege-aware corpus filtering, citation-first city-record search, prior-action lookup, attorney-reviewed memo scaffolds, ordinance comparison checklists, litigation-hold candidate flags, authority citation tracking, and accessible public UI foundation. |
| civicelections  | CivicSuite/civicelections         | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: voter guidance, candidate filing checklists, worker training Q&A, ballot-summary drafts, campaign-finance summaries, canvass checklists, accessibility review, and accessible public UI foundation. |
| civicutility    | CivicSuite/civicutility           | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: utility-policy Q&A, CSR-safe account context, payment-arrangement drafts, service-request intake, and accessible public UI foundation. |
| civiccourt      | CivicSuite/civiccourt             | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: procedure Q&A, court form drafts, restricted-record-aware search, hearing prep checklists, and accessible public UI foundation. |
| civicsafety     | CivicSuite/civicsafety            | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: non-CJIS policy/SOP Q&A, training checklists, PIO draft support, aggregate public-statistics summaries, and accessible public UI foundation. |
| civiclibrary    | CivicSuite/civiclibrary           | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: library policy Q&A, program/event answers, collection-metadata reference search, collection-development guidance, and accessible public UI foundation. |
| civicparks      | CivicSuite/civicparks             | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: parks policy Q&A, program/facility answers, registration-link assistance, maintenance request triage, and accessible public UI foundation. |

## Reading a row

`civicrecords-ai 1.4.0 ... ==0.2.0` means: records-ai version 1.4.0 requires
exactly civiccore 0.2.0. Mixing other civiccore versions with that records-ai
release produces undefined behavior. The `civiccore` row records the latest
platform release; module rows record the exact pins those module releases
actually ship with.

## Tested pairs (history)

| Date       | civiccore | Module / version       | Result   | Evidence                                                               |
|------------|-----------|------------------------|----------|------------------------------------------------------------------------|
| 2026-04-28 | 0.3.0     | civiccode 0.1.1        | green    | civiccode PR #20 merged at d03eaba; 106 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civiczone 0.1.1        | green    | civiczone PR #10 merged at acf9c6e; 34 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicaccess 0.1.1      | green    | civicaccess PR #3 merged at 9e2946b; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicplan 0.1.1        | green    | civicplan PR #2 merged at 814abcb; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicpermit 0.1.1      | green    | civicpermit PR #3 merged at cb2ec31; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicinspect 0.1.1     | green    | civicinspect PR #2 merged at f5b068e; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicgrants 0.1.1      | green    | civicgrants PR #2 merged at 1c532d6; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicprocure 0.1.1     | green    | civicprocure PR #2 merged at 5bd6de3; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-28 | 0.3.0     | civicclerk 0.1.0 main  | green    | civicclerk PR #27 and #28 merged; production-depth `/staff` import and packet export screens browser-QA verified; verify-release.sh PASSED |
| 2026-04-28 | 0.3.0     | civiccore 0.3.0        | green    | civiccore release workflow run 25037429110; PR #14; 122 tests passed; release assets published |
| 2026-04-27 | 0.2.0     | civiccode 0.1.0        | green    | civiccode v0.1.0 release at e0f4c06; 106 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiczone 0.1.0        | green    | civiczone v0.1.0 release at 30dc671; 34 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicaccess 0.1.0      | green    | civicaccess v0.1.0 release at ee9a634; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicplan 0.1.0        | green    | civicplan v0.1.0 release at 4e45a98; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicpermit 0.1.0      | green    | civicpermit v0.1.0 release at 7fc8ec5; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicinspect 0.1.0     | green    | civicinspect v0.1.0 release at 7760850; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicgrants 0.1.0      | green    | civicgrants v0.1.0 release at 8c3f04d; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicprocure 0.1.0     | green    | civicprocure v0.1.0 release at c326534; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiccontracts 0.1.0   | green    | civiccontracts v0.1.0 release at 16306ff; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicboards 0.1.0      | green    | civicboards v0.1.0 release at c8c1e25; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicnotice 0.1.0      | green    | civicnotice v0.1.0 release at de4e5ac; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civic311 0.1.0         | green    | civic311 v0.1.0 release at 0cdd512; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiccomms 0.1.0       | green    | civiccomms v0.1.0 release at a9ad1d4; 11 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicdata 0.1.0        | green    | civicdata v0.1.0 release at f30ac3f; 14 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civichr 0.1.0          | green    | civichr v0.1.0 release at 8d674e1; 16 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicbudget 0.1.0      | green    | civicbudget v0.1.0 release at 106f414; 11 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiclegal 0.1.0       | green    | civiclegal v0.1.0 release at 375fc0b; 14 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicelections 0.1.0   | green    | civicelections v0.1.0 release at 5d3ae37; 12 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicutility 0.1.0     | green    | civicutility v0.1.0 release at f5ac5a3; 9 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiccourt 0.1.0       | green    | civiccourt v0.1.0 release at 6771294; 9 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicsafety 0.1.0      | green    | civicsafety v0.1.0 release at 7fa309b; 9 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiclibrary 0.1.0     | green    | civiclibrary v0.1.0 release at 9e31f2f; 9 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicparks 0.1.0       | green    | civicparks v0.1.0 release at 06fbced; 9 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicclerk 0.1.0       | green    | civicclerk release workflow run 24975592931; CivicClerk v0.1.0 published with civiccore 0.2.0 wheel |
| 2026-04-27 | 0.2.0     | civicclerk 0.1.0 + staff UI foundation | green | civicclerk PR #14 merged; 358 tests passed; browser QA verified `/staff` desktop/mobile states |
| 2026-04-26 | 0.2.0     | civicrecords-ai 1.4.0  | green    | docs/architecture-graphics-pass merged across all 3 repos; ruff + verify-release.sh PASSED on records-ai |
| 2026-04-25 | 0.2.0     | civicrecords-ai 1.4.0  | green    | records-ai release workflow run 24943570795; CivicRecords AI v1.4.0 published with civiccore 0.2.0 wheel |
| 2026-04-25 | 0.1.x     | civicrecords-ai 1.3.0  | green    | prior pre-Phase-2 baseline                                             |

## Update policy

- Updated every time a module ships a new version that changes its civiccore pin.
- Updated every time civiccore ships a new MINOR or MAJOR (PATCH releases of civiccore are pin-compatible by definition).
- When a row changes, also update CONSISTENCY.md if any number listed there moves.
