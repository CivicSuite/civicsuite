# CivicCore <-> Module Compatibility Matrix

This matrix tracks the compatibility contract between the shared `civiccore`
package and the suite modules that consume it. It is the suite's
release-pairing truth-source — when a row changes, this is the canonical
record.

| Module          | Repo                              | Current version | Released   | Compatible CivicCore range | Last verified | Notes                                                                                          |
|-----------------|-----------------------------------|-----------------|------------|----------------------------|---------------|------------------------------------------------------------------------------------------------|
| civiccore       | CivicSuite/civiccore              | 0.2.0           | 2026-04-25 | n/a                        | 2026-04-25    | Phase 2 LLM-abstraction module shipped. Backward-compatible with 0.1.x consumers.              |
| civicrecords-ai | CivicSuite/civicrecords-ai     | 1.4.0           | 2026-04-25 | `==0.2.0`                  | 2026-04-25    | Phase 2 LLM integration; depends on the civiccore v0.2.0 release wheel. Transferred to the CivicSuite org on 2026-04-25. |
| civicclerk      | (not created)                     | n/a             | n/a        | n/a                        | n/a           | Planned future module — spec drafted only, no code.                                            |

## Reading a row

`civicrecords-ai 1.4.0 ... ==0.2.0` means: records-ai version 1.4.0 requires
exactly civiccore 0.2.0. Mixing other civiccore versions with that records-ai
release produces undefined behavior.

## Update policy

- Updated every time a module ships a new version that changes its civiccore pin.
- Updated every time civiccore ships a new MINOR or MAJOR (PATCH releases of civiccore are pin-compatible by definition).
- When a row changes, also update CONSISTENCY.md if any number listed there moves.
