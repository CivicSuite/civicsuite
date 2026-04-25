# CivicCore <-> Module Compatibility Matrix

Phase 1 shipped on 2026-04-24. This matrix tracks the compatibility contract
between the shared `civiccore` package and the suite modules that consume it.

| Module         | Repo                          | Current version | Compatible CivicCore range | Last verified | Notes                              |
|----------------|-------------------------------|-----------------|----------------------------|---------------|------------------------------------|
| civiccore      | CivicSuite/civiccore          | 0.1.0           | n/a                        | 2026-04-24    | First versioned release artifact for Phase 1 |
| civicrecords-ai | scottconverse/civicrecords-ai | 1.3.0 | `==0.1.0` | 2026-04-25 | Phase 1 merged; civiccore 0.1.0 consumed as release wheel. |

When a row is populated, also update CONSISTENCY.md if any number changes.
