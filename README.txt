CivicSuite
==========

An open-source, sovereignly deployable municipal product suite that runs on
the city's own hardware.

This `civicsuite` repository is the umbrella repo for the CivicSuite product
family. It holds suite-wide documentation, governance, the roadmap, ADRs, and
the compatibility matrix. It does not contain runtime code; each product
module lives in its own repo.

Suite status
------------

Status snapshot: 2026-05-03

- Shipping: 1 of 28 product modules.
  `civicrecords-ai` is the one product currently positioned as
  production-usable today.
- Productizing: 1 of 28 product modules.
  `civicclerk` now has all four MVP workflow surfaces in React, a Docker
  Compose product rehearsal with seeded demo data, OIDC browser-session
  foundations, backup/restore rehearsal, vendor-network live sync with shared
  CivicCore retry/circuit primitives, scheduled local connector import sync,
  installer source packaging, and enterprise signing readiness. It still needs
  production deployment hardening before city production use; unsigned
  installer warnings are expected during developer-cycle installs until a
  certificate is available.
- Foundation / planned: 26 of 28 product modules.
  The rest of the catalog has real runtime foundations or new implementation
  specs. CivicRegWatch and CivicAPI are newly added planned modules with
  detailed specs but no runtime repos yet.

`civiccore` is not a product module; it is the shared platform package used by
every module. The latest shared-platform release is `civiccore v0.21.0`.

The most important distinction in this repo is simple: "all repos have
releases" is not the same thing as "a city can run on this suite." The roadmap
in `docs/roadmap/index.md` is the plan to close that gap.

What ships today
----------------

- `civicrecords-ai v1.4.8` is the flagship shipping product for FOIA/public
  records management. Repo: https://github.com/CivicSuite/civicrecords-ai
- `civiccore v0.21.0` is the shipping shared platform package. It currently
  ships migrations, shared SQLAlchemy baselines, the LLM abstraction layer,
  audit/provenance primitives, persisted audit-log hash/verification helpers,
  export/manifest helpers, city profiles, shared
  auth/RBAC helpers, notice-compliance helpers, onboarding profile helpers,
  search/access helpers, connector/import helpers, live-sync retry/circuit
  primitives, reusable vendor-delta planning, reusable mock-city vendor/IdP/
  backup-retention contracts, release-evidence helpers,
  and trusted-header config/proxy enforcement helpers. Repo:
  https://github.com/CivicSuite/civiccore
- `civicclerk v0.1.19` is the clear second-product candidate. It ships the React
  staff workspace and public portal, all four MVP meeting-workflow surfaces,
  Docker Compose product rehearsal, seeded Brookfield demo data, OIDC
  browser-session foundations, backup/restore rehearsal, vendor-network live
  sync with shared CivicCore retry/circuit primitives, reusable mock municipal
  IdP and backup-retention contract suites, scheduled local connector import
  sync, installer source packaging, enterprise signing readiness, and
  shared `civiccore` v0.21.0 startup config validation reuse, but it is still
  in the productizing tier because production deployment proof is site-specific.
  Repo:
  https://github.com/CivicSuite/civicclerk
- `civiccode v0.1.6` is the active municipal-code productization lane. It
  ships source-registry persistence, the staff-only source registry workspace,
  the staff code lifecycle workspace, staff-header-protected source registry
  operations, public lookup/search foundations, and the shared
  reusable mock-city codifier contracts, and the shared `civiccore v0.21.0`
  release wheel. Repo:
  https://github.com/CivicSuite/civiccode
- CivicRegWatch and CivicAPI are newly added planned modules. CivicRegWatch is
  federal regulatory intelligence for municipal operators; CivicAPI is the
  public read-only data gateway over human-approved CivicSuite publication
  records. Detailed specs live in `specs/05_civicregwatch.md` and
  `specs/06_civicapi.md`.

The rest of the catalog is real foundation work, not vapor. Those modules ship
schemas, sample workflow slices, accessible sample UI, tests, and release
gates. They do not yet all ship the workflow, security, identity, connector,
and operational depth required to call them full products.

Current priorities
------------------

The canonical roadmap lives at `docs/roadmap/index.md`. The immediate sequence
is:

1. Use the shared extraction consumer rollout playbook for the next
   `civiccore` fan-out work.
2. Keep extracting reusable `civicrecords-ai` and `civicclerk` capabilities
   into `civiccore` when they will serve more than one module.
3. Drive `civicclerk` to second-product status with municipal IdP
   configuration proof, deployment hardening, and explicit unsigned-installer
   operator guidance.
4. Continue the CivicCode productization lane using the same product-first
   code/docs/QA release loop.
5. Scaffold CivicRegWatch and CivicAPI only after their publication, polling,
   auth, and inter-module ADRs are settled.
6. Formalize cross-module integration ownership for the first deployable
   starter set.

The current shared rollout pattern is documented in
`docs/roadmap/shared-extraction-consumer-rollout.md`.

Continuity
----------

Continuity is now an explicit gate, not a "later" governance item.

- Continuity plan: `SUCCESSION.md`
- Governance index: `docs/governance/index.md`
- Charter: `CHARTER.md`

Current state as of 2026-04-30: the `CivicSuite` GitHub org has two active
owners (`scottconverse` and `APirateMonk`), and the continuity baseline is
documented in `SUCCESSION.md`.

Quick start
-----------

There is nothing to install from the umbrella repo itself. Start with the
module that matches your need:

- FOIA / public records management:
  https://github.com/CivicSuite/civicrecords-ai
- Shared platform/library work:
  https://github.com/CivicSuite/civiccore
- Suite orientation and roadmap:
  `docs/index.html` and `docs/roadmap/index.md`

If you are orienting yourself for the first time, read in this order:

1. `docs/CivicSuiteUnifiedSpec.md`
2. `USER-MANUAL.md`
3. `CHARTER.md`
4. `docs/roadmap/index.md`
5. `docs/compatibility/index.md`

Repo map
--------

- `civicsuite`: umbrella repo; roadmap, governance, specs, ADRs, compatibility
  truth source
- `civiccore`: shared platform package consumed by every module
- `civicrecords-ai`: shipping flagship product
- `civicclerk`: productizing second-product candidate
- `civiccode`: active municipal-code productization lane
- `civiczone` through `civicparks`: foundation-tier module repos with bounded
  shipped surfaces
- `civicregwatch`: planned federal regulatory intelligence module; spec exists,
  repo not scaffolded yet
- `civicapi`: planned public read-only data gateway module; spec exists, repo
  not scaffolded yet

See `docs/compatibility/index.md` for the canonical module-to-platform version
pairings.

Architecture
------------

Every module inherits the same deliberately boring stack: FastAPI, PostgreSQL
17 with `pgvector`, Redis 7.2, Celery, Ollama, and React behind nginx. The
dependency rule is one-way: modules depend on `civiccore`; `civiccore` never
depends on modules. Cities run the stack on their own hardware. No cloud, no
telemetry, no per-seat pricing.

The suite is aiming for a first deployable "city starter set," not for all 28
product modules to become equally deep at the same time. That distinction is
intentional and load-bearing.

Documentation
-------------

- Landing page: `docs/index.html`
- Roadmap: `docs/roadmap/index.md`
- Shared rollout playbook: `docs/roadmap/shared-extraction-consumer-rollout.md`
- Governance: `docs/governance/index.md`
- Compatibility matrix: `docs/compatibility/index.md`
- Unified spec: `docs/CivicSuiteUnifiedSpec.md`
- User manual: `USER-MANUAL.md`

Licensing
---------

- Documentation in this repo: CC BY 4.0
- Code snippets in this repo: Apache License 2.0
- Module repos generally follow Apache 2.0 for code and CC BY 4.0 for docs

Contributing
------------

See `CONTRIBUTING.md` for the bug-routing decision tree and contribution
process. By participating, you agree to the `CODE_OF_CONDUCT.md`.

Support
-------

See `SUPPORT.md` for support paths and `SECURITY.md` for vulnerability
reporting.
