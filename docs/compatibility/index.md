# CivicCore <-> Module Compatibility Matrix

Phase 1 shipped on 2026-04-24. This matrix tracks the compatibility contract
between the shared `civiccore` package and the suite modules that consume it.

| Module         | Repo                          | Current version | Compatible CivicCore range | Last verified | Notes                              |
|----------------|-------------------------------|-----------------|----------------------------|---------------|------------------------------------|
| civiccore      | CivicSuite/civiccore          | 0.1.0           | n/a                        | 2026-04-24    | First versioned release artifact for Phase 1 |
| civicrecords-ai | scottconverse/civicrecords-ai | master (`1.2.0` file version; `v1.3.0` pending) | `==0.1.0` | 2026-04-24 | Phase 1 merged at `0cd5a7a`; consumes the `civiccore` `v0.1.0` release wheel during release hardening |

When a row is populated, also update CONSISTENCY.md if any number changes.
