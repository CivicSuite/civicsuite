# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source — when a row changes, this is the canonical
record.

| Module          | Repo                              | Current version | Released   | Compatible CivicCore range | Last verified | Notes                                                                                          |
|-----------------|-----------------------------------|-----------------|------------|----------------------------|---------------|------------------------------------------------------------------------------------------------|
| civiccore       | CivicSuite/civiccore              | 0.2.0           | 2026-04-25 | n/a                        | 2026-04-26    | Phase 2 LLM-abstraction module shipped. Backward-compatible with 0.1.x consumers.              |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.0           | 2026-04-25 | `==0.2.0`                  | 2026-04-26    | Phase 2 LLM integration; depends on the civiccore v0.2.0 release wheel. Transferred to the CivicSuite org on 2026-04-25. |
| civicclerk      | CivicSuite/civicclerk             | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | Runtime foundation release: schema, lifecycle enforcement, packet/notice, motion/vote/action capture, minutes citations, public archive, prompt evals, connector imports, browser QA gates, and `/staff` workflow UI foundation. |
| civiccode       | CivicSuite/civiccode              | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: source registry, section/version lifecycle, search/permalinks, citations, citation-grounded Q&A, staff notes, summaries, CivicClerk handoff intake, public lookup, local imports, and records-ready exports. |
| civiczone       | CivicSuite/civiczone              | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: canonical zoning schema, parcel/zone lookup, use and dimensional rule APIs, citation-grounded sample Q&A, planner escalation/staff context samples, and accessible public UI foundation. |
| civicaccess     | CivicSuite/civicaccess            | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: accessibility review, plain-language rewrite, multilingual sample variants, records-ready export checklist, and accessible public UI foundation. |
| civicplan       | CivicSuite/civicplan              | 0.1.0           | 2026-04-27 | `==0.2.0`                  | 2026-04-27    | First runtime release: cited plan-policy lookup, policy-consistency support, staff-analysis outline helper, records-ready export checklist, and accessible public UI foundation. |

## Reading a row

`civicrecords-ai 1.4.0 ... ==0.2.0` means: records-ai version 1.4.0 requires
exactly civiccore 0.2.0. Mixing other civiccore versions with that records-ai
release produces undefined behavior.

## Tested pairs (history)

| Date       | civiccore | Module / version       | Result   | Evidence                                                               |
|------------|-----------|------------------------|----------|------------------------------------------------------------------------|
| 2026-04-27 | 0.2.0     | civiccode 0.1.0        | green    | civiccode v0.1.0 release at e0f4c06; 106 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civiczone 0.1.0        | green    | civiczone v0.1.0 release at 30dc671; 34 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicaccess 0.1.0      | green    | civicaccess v0.1.0 release at ee9a634; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicplan 0.1.0        | green    | civicplan v0.1.0 release at 4e45a98; 10 tests passed; verify-release.sh PASSED; GitHub release assets published |
| 2026-04-27 | 0.2.0     | civicclerk 0.1.0       | green    | civicclerk release workflow run 24975592931; CivicClerk v0.1.0 published with civiccore 0.2.0 wheel |
| 2026-04-27 | 0.2.0     | civicclerk 0.1.0 + staff UI foundation | green | civicclerk PR #14 merged; 358 tests passed; browser QA verified `/staff` desktop/mobile states |
| 2026-04-26 | 0.2.0     | civicrecords-ai 1.4.0  | green    | docs/architecture-graphics-pass merged across all 3 repos; ruff + verify-release.sh PASSED on records-ai |
| 2026-04-25 | 0.2.0     | civicrecords-ai 1.4.0  | green    | records-ai release workflow run 24943570795; CivicRecords AI v1.4.0 published with civiccore 0.2.0 wheel |
| 2026-04-25 | 0.1.x     | civicrecords-ai 1.3.0  | green    | prior pre-Phase-2 baseline                                             |

## Update policy

- Updated every time a module ships a new version that changes its civiccore pin.
- Updated every time civiccore ships a new MINOR or MAJOR (PATCH releases of civiccore are pin-compatible by definition).
- When a row changes, also update CONSISTENCY.md if any number listed there moves.
