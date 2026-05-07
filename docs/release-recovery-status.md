# CivicSuite Release Recovery Status

Status date: 2026-05-07

## Current Rule

Public "shipping", "product-ready", "city-ready", and "v1.0.0 proves
release maturity" claims are frozen across the CivicSuite family until each
repo re-earns that status through the recovery gates below.

Existing GitHub tags remain historical release artifacts. They must be treated
as provisional labels, not procurement or production-readiness claims, unless a
repo has passed its recovery gate after this document's status date.

## Recovery Gates

Each repo must pass all applicable gates before any public doc calls it
product-ready, shipping, city-ready, or a completed v1 product:

1. Full audit packet using the workspace `audit-full` standard.
2. Careful-coding evidence for every non-trivial fix.
3. Real user-flow Playwright tests for every frontend product path.
4. Runtime install proof from a clean environment.
5. Version and compatibility consistency checks across source, docs, tags, and matrix.
6. Security scans for code, dependency, and secret risks.
7. Documentation source-of-truth enforcement.
8. Explicit mock-vs-production labeling for every integration, identity, connector, backup, vendor, and AI claim.
9. Release notes that separate code changes from docs-only changes.
10. CI evidence that publishes or links the artifacts used to make the claim.

## Current Repo Status

| Repo | Public label before recovery | Recovery status |
|---|---|---|
| civicrecords-ai | v1.4.10 shipping flagship | Provisional; do not promote until recovery gate passes. |
| civiccore | v1.0 shared platform | Provisional; do not promote until recovery gate passes. |
| civicclerk | v1.0.0 productizing candidate | Provisional; do not promote until recovery gate passes. |
| civiccode | v1.0.0 / active productization line | Provisional; do not promote until recovery gate passes. |
| civiczone | v1.0.0 | Provisional; do not promote until recovery gate passes. |
| civicplan | v1.0.0 | Provisional; do not promote until recovery gate passes. |
| civicpermit | v1.0.0 | Provisional; do not promote until recovery gate passes. |
| civicinspect and remaining modules | v0.1.x foundations | Foundation only; not product-ready. |

## Language Rules

Use:

- "public tag exists"
- "historical release artifact"
- "provisional release label"
- "foundation surface"
- "mock contract fixture"
- "docs-render smoke"

Do not use until a recovery gate passes:

- "product-ready"
- "city-ready"
- "shipping product"
- "production-usable"
- "browser QA" for static docs rendering
- "ships OIDC/vendor/backup integration" when only a mock or fixture exists

