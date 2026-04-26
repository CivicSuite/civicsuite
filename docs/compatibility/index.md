# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source — when a row changes, this is the canonical
record.

| Module          | Repo                              | Current version | Released   | Compatible CivicCore range | Last verified | Notes                                                                                          |
|-----------------|-----------------------------------|-----------------|------------|----------------------------|---------------|------------------------------------------------------------------------------------------------|
| civiccore       | CivicSuite/civiccore              | 0.2.0           | 2026-04-25 | n/a                        | 2026-04-26    | Phase 2 LLM-abstraction module shipped. Backward-compatible with 0.1.x consumers.              |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.0           | 2026-04-25 | `==0.2.0`                  | 2026-04-26    | Phase 2 LLM integration; depends on the civiccore v0.2.0 release wheel. Transferred to the CivicSuite org on 2026-04-25. |
| civicclerk      | CivicSuite/civicclerk             | 0.0.0           | n/a        | `>=0.2.0,<0.3.0` planned   | 2026-04-26    | Scaffolded repo; documentation baseline only, no runtime release yet.                           |

## Reading a row

`civicrecords-ai 1.4.0 ... ==0.2.0` means: records-ai version 1.4.0 requires
exactly civiccore 0.2.0. Mixing other civiccore versions with that records-ai
release produces undefined behavior.

## Tested pairs (history)

| Date       | civiccore | civicrecords-ai | Result   | Evidence                                                               |
|------------|-----------|-----------------|----------|------------------------------------------------------------------------|
| 2026-04-26 | 0.2.0     | 1.4.0           | green    | docs/architecture-graphics-pass merged across all 3 repos; ruff + verify-release.sh PASSED on records-ai |
| 2026-04-25 | 0.2.0     | 1.4.0           | green    | records-ai release workflow run 24943570795; CivicRecords AI v1.4.0 published with civiccore 0.2.0 wheel |
| 2026-04-25 | 0.1.x     | 1.3.0           | green    | prior pre-Phase-2 baseline                                             |

## Update policy

- Updated every time a module ships a new version that changes its civiccore pin.
- Updated every time civiccore ships a new MINOR or MAJOR (PATCH releases of civiccore are pin-compatible by definition).
- When a row changes, also update CONSISTENCY.md if any number listed there moves.
